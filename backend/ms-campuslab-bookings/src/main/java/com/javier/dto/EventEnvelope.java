package com.javier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.MDC;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEnvelope<T> {
    private String type;
    private String eventId;
    private Long timestamp;
    private String traceId;
    private String correlationId;
    private T payload;

    public static <T> EventEnvelope<T> create(String type, T payload) {
        return create(type, null, payload);
    }

    public static <T> EventEnvelope<T> create(String type, String correlationId, T payload) {
        String mdcCorrelationId = MDC.get("correlationId");
        String mdcTraceId = MDC.get("traceId");

        String finalCorrelationId = (correlationId != null && !correlationId.isBlank())
                ? correlationId
                : (mdcCorrelationId != null && !mdcCorrelationId.isBlank()
                        ? mdcCorrelationId
                        : UUID.randomUUID().toString());

        String finalTraceId = (mdcTraceId != null && !mdcTraceId.isBlank())
                ? mdcTraceId
                : UUID.randomUUID().toString();

        return EventEnvelope.<T>builder()
                .type(type)
                .eventId(UUID.randomUUID().toString())
                .timestamp(Instant.now().toEpochMilli())
                .traceId(finalTraceId)
                .correlationId(finalCorrelationId)
                .payload(payload)
                .build();
    }
}