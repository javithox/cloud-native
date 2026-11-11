package com.javier.consumer;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class NotificationListener {

    // =========================================================================
    // 1. CONSUMIDORES DE COLAS PRINCIPALES
    // =========================================================================

    @RabbitListener(queues = "q.cmd.email")
    public void handleEmailNotification(String payload, 
                                        @Header(value = "x-correlation-id", required = false) String correlationId) {
        setMdcContext(correlationId);
        try {
            log.info("[q.cmd.email] Procesando envío de Email/Push: {}", payload);
            
            // Si ocurre un error no capturado, Spring reintentará según la política 
            // y al agotarse enviará automáticamente a q.cmd.email.dlq
        } finally {
            MDC.clear();
        }
    }

    @RabbitListener(queues = "q.cmd.prep")
    public void handlePrepTicket(String payload, 
                                 @Header(value = "x-correlation-id", required = false) String correlationId) {
        setMdcContext(correlationId);
        try {
            log.info("[q.cmd.prep] Generando ticket de preparación para Técnico: {}", payload);
        } finally {
            MDC.clear();
        }
    }

    @RabbitListener(queues = "q.cmd.voucher")
    public void handleVoucherGeneration(String payload, 
                                         @Header(value = "x-correlation-id", required = false) String correlationId) {
        setMdcContext(correlationId);
        try {
            log.info("[q.cmd.voucher] Generando PDF de vale de retiro / devolución: {}", payload);
        } finally {
            MDC.clear();
        }
    }

    // =========================================================================
    // 2. LISTENERS DE AUDITORÍA Y MONITOREO DE DLQ (MENSAJES NO ENTREGADOS)
    // =========================================================================

    @RabbitListener(queues = "q.cmd.email.dlq")
    public void handleEmailDlq(Message message, @Header(value = "x-death", required = false) List> xDeath) {
        String payload = new String(message.getBody());
        log.error("ALERT - MENSAJE EN DLQ [q.cmd.email.dlq]. Payload: {} | Metadatos de fallo x-death: {}", payload, xDeath);
    }

    @RabbitListener(queues = "q.cmd.prep.dlq")
    public void handlePrepDlq(Message message, @Header(value = "x-death", required = false) List> xDeath) {
        String payload = new String(message.getBody());
        log.error("ALERT - MENSAJE EN DLQ [q.cmd.prep.dlq]. Payload: {} | Metadatos de fallo x-death: {}", payload, xDeath);
    }

    @RabbitListener(queues = "q.cmd.voucher.dlq")
    public void handleVoucherDlq(Message message, @Header(value = "x-death", required = false) List> xDeath) {
        String payload = new String(message.getBody());
        log.error("ALERT - MENSAJE EN DLQ [q.cmd.voucher.dlq]. Payload: {} | Metadatos de fallo x-death: {}", payload, xDeath);
    }

    // =========================================================================
    // HELPER METHOS
    // =========================================================================

    private void setMdcContext(String correlationId) {
        if (correlationId != null && !correlationId.isBlank()) {
            MDC.put("correlationId", correlationId);
        } else {
            MDC.put("correlationId", "UNKNOWN");
        }
    }
}