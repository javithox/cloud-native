package com.javier.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

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

    public static <T> EventEnvelope<T> create(String type, String correlationId, T payload) {
        return EventEnvelope.<T>builder()
                .type(type)
                .eventId(java.util.UUID.randomUUID().toString())
                .timestamp(Instant.now().toEpochMilli())
                .traceId(java.util.UUID.randomUUID().toString())
                .correlationId(correlationId != null ? correlationId : java.util.UUID.randomUUID().toString())
                .payload(payload)
                .build();
    }
}
