package com.javier.config;

import com.javier.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumidor Kafka encargado de enviar eventos de negocio al servicio de reportes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaReportConsumer {
    /*Llama al servicio Reportes */
    private final ReportService reportService;
    /*Agrega el evento de reportes a kafka */
    @KafkaListener(topics = "${campuslab.kafka.topics.booking-events:bookings.events}", groupId = "campuslab-report-group")
    public void onBookingEvent(ConsumerRecord<String, String> record) {
        reportService.consumeBookingEvent(record.value());
        log.info("Evento agregado para reportería: {}", record.value());
    }
}
