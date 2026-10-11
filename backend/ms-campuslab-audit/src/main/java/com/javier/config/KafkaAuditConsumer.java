package com.javier.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javier.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaAuditConsumer {

    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${campuslab.kafka.topics.booking-events:bookings.events}")
    private String bookingEventsTopic;

    @Value("${campuslab.kafka.topics.audit-timeline:audit.timeline}")
    private String auditTimelineTopic;

    @KafkaListener(topics = "${campuslab.kafka.topics.booking-events:bookings.events}", groupId = "campuslab-audit-group")
    public void onBookingEvent(ConsumerRecord<String, String> record) throws Exception {
        String payload = record.value();
        var node = objectMapper.readTree(payload);
        if (node.path("payload").isMissingNode() || node.path("eventId").asText().isBlank()) {
            throw new IllegalArgumentException("El evento no contiene payload de reserva o eventId");
        }
        String eventId = node.path("eventId").asText();
        String type = node.path("type").asText();
        String correlationId = node.path("correlationId").asText();
        String traceId = node.path("traceId").asText();
        Long timestamp = node.path("timestamp").asLong();

        auditService.saveAuditEvent(eventId, type, correlationId, traceId, timestamp, payload);
        kafkaTemplate.send(auditTimelineTopic, eventId, payload).get(10, TimeUnit.SECONDS);
        log.info("Evento auditado: {} | correlationId={} | traceId={}", type, correlationId, traceId);
    }
}
