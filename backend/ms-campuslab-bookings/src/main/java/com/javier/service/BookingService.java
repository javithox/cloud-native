package com.javier.service;

import com.javier.dto.BookingDTOs.*;
import com.javier.dto.EventEnvelope;
import com.javier.model.Booking;
import com.javier.model.BookingStatus;
import com.javier.repository.BookingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CatalogClient catalogClient;
    private final RabbitTemplate rabbitTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    // Añadimos valores por defecto después de los dos puntos (: valor)
    @Value("${campuslab.rabbitmq.exchanges.direct:cmd.direct}")
    private String directExchange;

    @Value("${campuslab.kafka.topics.booking-events:bookings.events}")
    private String bookingEventsTopic;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        String correlationId = "booking-create-" + request.getResourceId() + "-" + System.currentTimeMillis();
        try {
            if (!request.getEndTime().isAfter(request.getStartTime())) {
                throw new IllegalArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
            }
            if (request.getStartTime().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("La reserva debe comenzar en el futuro");
            }
            if (bookingRepository.existsOverlappingBooking(request.getResourceId(), request.getStartTime(),
                    request.getEndTime(), Arrays.asList(BookingStatus.CANCELADA, BookingStatus.DEVUELTA))) {
                throw new IllegalStateException("El recurso ya está reservado en el horario solicitado");
            }
            CatalogClient.ResourceInfo resource = catalogClient.getResource(request.getResourceId());
            if (resource == null || !Boolean.TRUE.equals(resource.active())) {
                throw new IllegalArgumentException("El recurso seleccionado no existe o está inactivo");
            }
            Booking booking = Booking.builder()
                    .studentId(request.getStudentId())
                    .studentEmail(request.getStudentEmail())
                    .resourceId(request.getResourceId())
                    .resourceName(resource.name())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .notes(request.getNotes())
                    .status(BookingStatus.SOLICITADA)
                    .build();

            booking = bookingRepository.save(booking);
            publishKafkaEvent("BOOKING_CREATED", booking, "booking-" + booking.getId());
            return mapToResponse(booking);
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("BOOKING_CREATE_ERROR", buildBookingErrorPayload(request.getResourceId(), request.getStudentId(), e.getMessage()), correlationId);
            throw e;
        }
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, UpdateStatusRequest request) {
        String correlationId = "booking-status-" + id;
        try {
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

            BookingStatus currentStatus = booking.getStatus();
            BookingStatus newStatus = request.getStatus();

            if (!currentStatus.canTransitionTo(newStatus)) {
                throw new IllegalStateException(
                        String.format("Transición de estado inválida: No se puede cambiar de %s a %s",
                                currentStatus,
                                newStatus)
                );
            }

            if (newStatus == BookingStatus.APROBADA) {
                catalogClient.reserve(booking.getResourceId(), 1);
            } else if (newStatus == BookingStatus.CANCELADA && currentStatus == BookingStatus.APROBADA) {
                catalogClient.release(booking.getResourceId(), 1);
            } else if (newStatus == BookingStatus.DEVUELTA) {
                catalogClient.release(booking.getResourceId(), 1);
            }
            booking.setStatus(newStatus);
            booking = bookingRepository.save(booking);

            handleStatusSideEffects(booking, newStatus);
            publishKafkaEvent("BOOKING_STATUS_CHANGED", booking, "booking-" + booking.getId());

            return mapToResponse(booking);
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("BOOKING_STATUS_ERROR", buildBookingErrorPayload(null, "system", e.getMessage()), correlationId);
            throw e;
        }
    }

    @Transactional
    public BookingResponse deleteBooking(Long id) {
        String correlationId = "booking-delete-" + id;
        try {
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

            if (booking.getStatus() != BookingStatus.CANCELADA) {
                booking.setStatus(BookingStatus.CANCELADA);
                booking = bookingRepository.save(booking);
                publishKafkaEvent("BOOKING_CANCELLED", booking, "booking-" + booking.getId());
            }

            return mapToResponse(booking);
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("BOOKING_DELETE_ERROR", buildBookingErrorPayload(null, "system", e.getMessage()), correlationId);
            throw e;
        }
    }

    public BookingResponse getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));
    }

    public List<BookingResponse> getBookings(BookingStatus status, LocalDateTime from, LocalDateTime to) {
        List<Booking> bookings;
        if (status != null && from != null && to != null) {
            bookings = bookingRepository.findByStatusAndStartTimeGreaterThanEqualAndEndTimeLessThanEqualOrderByStartTimeAsc(status, from, to);
        } else if (status != null) {
            bookings = bookingRepository.findByStatusOrderByStartTimeAsc(status);
        } else if (from != null && to != null) {
            bookings = bookingRepository.findByStartTimeGreaterThanEqualAndEndTimeLessThanEqualOrderByStartTimeAsc(from, to);
        } else {
            bookings = bookingRepository.findAllByOrderByStartTimeAsc();
        }
        return bookings
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void handleStatusSideEffects(Booking booking, BookingStatus newStatus) {
        String correlationId = "booking-" + booking.getId();

        switch (newStatus) {
            case APROBADA -> {
                // Notificar por correo al estudiante[cite: 1]
                sendRabbitCommand("email.send", EventEnvelope.create("EMAIL_NOTIFICATION", correlationId, booking));
                // Generar ticket de preparación al técnico[cite: 1]
                sendRabbitCommand("prep.ticket", EventEnvelope.create("PREP_TICKET", correlationId, booking));
            }
            case EN_PREPARACION -> {
                sendRabbitCommand("email.send", EventEnvelope.create("EMAIL_SALA_LISTA", correlationId, booking));
            }
            case DEVUELTA -> {
                // Notificar devolución y generar Vale / Acta[cite: 1]
                sendRabbitCommand("email.send", EventEnvelope.create("EMAIL_DEVOLUCION", correlationId, booking));
                sendRabbitCommand("voucher.gen", EventEnvelope.create("VOUCHER_GENERATE", correlationId, booking));
            }
            default -> log.info("Estado {} no requiere comandos RabbitMQ adicionales.", newStatus);
        }
    }

    private void sendRabbitCommand(String routingKey, Object payload) {
        rabbitTemplate.convertAndSend(directExchange, routingKey, payload);
    }

    private void publishKafkaEvent(String eventType, Object payload, String correlationId) {
        try {
            EventEnvelope<Object> envelope = EventEnvelope.create(eventType, correlationId, payload);
            String jsonPayload = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(bookingEventsTopic, correlationId, jsonPayload);
        } catch (Exception e) {
            log.error("Error al publicar evento en Kafka para {} con correlationId {}", eventType, correlationId, e);
        }
    }

    private java.util.Map<String, Object> buildBookingErrorPayload(Long resourceId, String user, String message) {
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("resourceId", resourceId);
        payload.put("resourceName", resourceId != null ? "Recurso " + resourceId : "Reserva");
        payload.put("status", "ERROR");
        payload.put("details", message);
        payload.put("user", user == null || user.isBlank() ? "system" : user);
        payload.put("error", true);
        return payload;
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse res = new BookingResponse();
        res.setId(booking.getId());
        res.setStudentId(booking.getStudentId());
        res.setStudentEmail(booking.getStudentEmail());
        res.setResourceId(booking.getResourceId());
        res.setResourceName(booking.getResourceName());
        res.setStartTime(booking.getStartTime());
        res.setEndTime(booking.getEndTime());
        res.setStatus(booking.getStatus());
        res.setNotes(booking.getNotes());
        res.setCreatedAt(booking.getCreatedAt());
        return res;
    }
}
