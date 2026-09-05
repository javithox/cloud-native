package com.javier.consumer;


import com.rabbitmq.client.Channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class NotificationListener {

    // 1. Escuchar cola de Email / Push (`q.cmd.email`)[cite: 1]
    @RabbitListener(queues = "q.cmd.email")
    public void handleEmailNotification(Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        try {
            String payload = new String(message.getBody());
            log.info("[q.cmd.email] Enviando Email/Push al estudiante: {}", payload);

            // Simulación de envío exitoso
            channel.basicAck(deliveryTag, false); // ACK Explícito[cite: 1]
        } catch (Exception e) {
            log.error("[q.cmd.email] Error procesando notificación, enviando a DLQ", e);
            // NACK -> Redirige a DLQ (q.cmd.email.dlq)[cite: 1]
            channel.basicNack(deliveryTag, false, false);
        }
    }

    // 2. Escuchar cola de Prep Ticket (`q.cmd.prep`)[cite: 1]
    @RabbitListener(queues = "q.cmd.prep")
    public void handlePrepTicket(Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        try {
            String payload = new String(message.getBody());
            log.info("[q.cmd.prep] Generando ticket de preparación de laboratorio para el Técnico: {}", payload);

            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("[q.cmd.prep] Error al generar ticket, enviando a DLQ", e);
            channel.basicNack(deliveryTag, false, false);
        }
    }

    // 3. Escuchar cola de Vouchers / Vales (`q.cmd.voucher`)[cite: 1]
    @RabbitListener(queues = "q.cmd.voucher")
    public void handleVoucherGeneration(Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        try {
            String payload = new String(message.getBody());
            log.info("[q.cmd.voucher] Generando PDF de vale de retiro / acta de devolución: {}", payload);

            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("[q.cmd.voucher] Error al generar voucher, enviando a DLQ", e);
            channel.basicNack(deliveryTag, false, false);
        }
    }
}