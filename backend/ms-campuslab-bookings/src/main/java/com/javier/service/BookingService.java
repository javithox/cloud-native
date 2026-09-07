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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RabbitTemplate rabbitTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    // Añadimos valores por defecto después de los dos puntos (: valor)
    @Value("${campuslab.rabbitmq.exchanges.direct:booking.direct.exchange}")
    private String directExchange;

    @Value("${campuslab.kafka.topics.booking-events:booking-events-topic}")
    private String bookingEventsTopic;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        Booking booking = Booking.builder()
                .studentId(request.getStudentId())
                .studentEmail(request.getStudentEmail())
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .notes(request.getNotes())
                .status(BookingStatus.SOLICITADA)
                .build();

        booking = bookingRepository.save(booking);

        // Notificar creación vía Kafka (Streaming Auditoría/Reportería)
        publishKafkaEvent("BOOKING_CREATED", booking);

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, UpdateStatusRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

        BookingStatus currentStatus = booking.getStatus();
        BookingStatus newStatus = request.getStatus();

        // Validar Regla del Negocio
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                    String.format("Transición de estado inválida: No se puede cambiar de %s a %s[cite: 1]",
                            currentStatus,
                            newStatus)
            );
        }

        booking.setStatus(newStatus);
        booking = bookingRepository.save(booking);

        // Transiciones y Comandos Asíncronos RabbitMQ[cite: 1]
        handleStatusSideEffects(booking, newStatus);

        // Evento streaming Kafka[cite: 1]
        publishKafkaEvent("BOOKING_STATUS_CHANGED", booking);

        return mapToResponse(booking);
    }

    public BookingResponse getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));
    }

    public List<BookingResponse> getBookings(BookingStatus status, LocalDateTime from, LocalDateTime to) {
        return bookingRepository.filterBookings(status, from, to)
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

    private void publishKafkaEvent(String eventType, Booking booking) {
        try {
            EventEnvelope<Booking> envelope = EventEnvelope.create(eventType, "booking-" + booking.getId(), booking);
            String jsonPayload = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(bookingEventsTopic, booking.getId().toString(), jsonPayload);
        } catch (Exception e) {
            log.error("Error al publicar evento en Kafka para la reserva ID {}", booking.getId(), e);
        }
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