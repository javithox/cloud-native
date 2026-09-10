package com.javier.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javier.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaAuditConsumer {

    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Value("${campuslab.kafka.topics.booking-events:booking-events-topic}")
    private String bookingEventsTopic;

    @KafkaListener(topics = "${campuslab.kafka.topics.booking-events:booking-events-topic}", groupId = "campuslab-audit-group")
    public void onBookingEvent(ConsumerRecord<String, String> record) {
        try {
            String payload = record.value();
            var node = objectMapper.readTree(payload);
            String type = node.path("type").asText();
            String correlationId = node.path("correlationId").asText();
            String traceId = node.path("traceId").asText();
            Long timestamp = node.path("timestamp").asLong();

            auditService.saveAuditEvent(type, correlationId, traceId, timestamp, payload);
            log.info("Evento auditado: {} | correlationId={} | traceId={}", type, correlationId, traceId);
        } catch (Exception e) {
            log.error("Error consumiendo evento de Kafka para auditoría: {}", record.value(), e);
        }
    }
}
