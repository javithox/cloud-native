package com.javier.config;

import com.javier.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaReportConsumer {

    private final ReportService reportService;

    @KafkaListener(topics = "${campuslab.kafka.topics.booking-events:booking-events-topic}", groupId = "campuslab-report-group")
    public void onBookingEvent(ConsumerRecord<String, String> record) {
        try {
            String payload = record.value();
            reportService.consumeBookingEvent(payload);
            log.info("Evento agregado para reportería: {}", payload);
        } catch (Exception e) {
            log.error("Error consumiendo evento de Kafka para reportes: {}", record.value(), e);
        }
    }
}
