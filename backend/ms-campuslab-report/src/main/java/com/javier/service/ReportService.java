package com.javier.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javier.model.ReportMetric;
import com.javier.repository.ReportMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportMetricRepository reportMetricRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void consumeBookingEvent(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            JsonNode booking = node.path("payload");
            if (booking == null || booking.isMissingNode()) {
                return;
            }

            String status = booking.path("status").asText();
            if (status.isBlank()) {
                return;
            }

            double total = reportMetricRepository.findLatestByMetricName("booking_total").stream()
                    .mapToDouble(ReportMetric::getValue)
                    .sum();

            reportMetricRepository.save(ReportMetric.builder()
                    .metricName("booking_total")
                    .dimension(status)
                    .value(total + 1)
                    .capturedAt(Instant.now())
                    .build());

            reportMetricRepository.save(ReportMetric.builder()
                    .metricName("booking_status_count")
                    .dimension(status)
                    .value(1d)
                    .capturedAt(Instant.now())
                    .build());

            log.info("Métrica reportada para status {}", status);
        } catch (Exception e) {
            log.error("Error agregando evento de reserva para reportería: {}", payload, e);
        }
    }

    public Map<String, Double> getKpis() {
        Map<String, Double> metrics = new HashMap<>();
        metrics.put("booking_total", reportMetricRepository.findLatestByMetricName("booking_total").stream()
                .mapToDouble(ReportMetric::getValue)
                .max()
                .orElse(0d));
        metrics.put("booking_status_count", reportMetricRepository.findLatestByMetricName("booking_status_count").stream()
                .mapToDouble(ReportMetric::getValue)
                .sum());
        return metrics;
    }

    public List<ReportMetric> getMetricsByDimension(String dimension) {
        return reportMetricRepository.findByDimensionOrderByCapturedAtDesc(dimension);
    }
}
