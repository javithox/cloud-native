package com.javier.Sender;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Sender {

    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public Sender(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMessage(String message) {
        try {
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("HH:mm:ss.SSS"));

            String fullMessage = String.format(
                    "[%s] %s",
                    timestamp,
                    message
            );

            // Enviar el mensaje a la cola.
            // exchange="" usa el exchange por defecto.
            // routingKey="hello" especifica la cola destino.
            rabbitTemplate.convertAndSend("", "hello", fullMessage);

            System.out.println(
                    "[✓] Mensaje enviado: '" + fullMessage + "'"
            );

        } catch (Exception e) {
            System.err.println(
                    "[✗] Error enviando mensaje: " + e.getMessage()
            );
            e.printStackTrace();
        }
    }

    /**
     * Versión sobrecargada con exchange explícito
     * (para casos más avanzados).
     */
    public void sendMessage(
            String exchange,
            String routingKey,
            String message
    ) {
        try {
            rabbitTemplate.convertAndSend(
                    exchange,
                    routingKey,
                    message
            );

            System.out.println(
                    "[✓] Mensaje enviado a exchange='"
                    + exchange
                    + "', routingKey='"
                    + routingKey
                    + "': '"
                    + message
                    + "'"
            );

        } catch (Exception e) {
            System.err.println(
                    "[✗] Error enviando mensaje: " + e.getMessage()
            );
            e.printStackTrace();
        }
    }
}
