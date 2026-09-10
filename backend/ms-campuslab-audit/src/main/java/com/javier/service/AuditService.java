package com.javier.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javier.model.AuditEvent;
import com.javier.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AuditEvent saveAuditEvent(String eventType, String correlationId, String traceId, Long timestamp, String payload) {
        AuditEvent event = AuditEvent.builder()
                .eventType(eventType)
                .correlationId(correlationId)
                .traceId(traceId)
                .timestamp(timestamp)
                .payload(payload)
                .build();
        return auditEventRepository.save(event);
    }

    public List<AuditEvent> getAuditTimeline() {
        return auditEventRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditEvent> getAuditByCorrelationId(String correlationId) {
        return auditEventRepository.findByCorrelationIdOrderByTimestampAsc(correlationId);
    }

    public String getEventSummary(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            JsonNode booking = node.get("payload");
            if (booking != null && booking.has("status")) {
                return booking.get("status").asText();
            }
            return "EVENT";
        } catch (Exception e) {
            log.warn("No se pudo resumir el payload de auditoría", e);
            return "EVENT";
        }
    }
}