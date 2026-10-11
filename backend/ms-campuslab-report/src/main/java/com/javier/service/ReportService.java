package com.javier.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javier.model.ProcessedReportEvent;
import com.javier.model.ReportMetric;
import com.javier.repository.ProcessedReportEventRepository;
import com.javier.repository.ReportMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private static final Pattern RANGE = Pattern.compile("last(\\d+)(h|d)", Pattern.CASE_INSENSITIVE);
    private static final DateTimeFormatter HOUR = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:00").withZone(ZoneId.of("UTC"));

    private final ReportMetricRepository reportMetricRepository;
    private final ProcessedReportEventRepository processedReportEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void consumeBookingEvent(String payload) {
        final JsonNode envelope;
        try {
            envelope = objectMapper.readTree(payload);
        } catch (Exception e) {
            throw new IllegalArgumentException("El evento Kafka no contiene JSON válido", e);
        }
        JsonNode booking = envelope.path("payload");
        String eventId = envelope.path("eventId").asText();
        if (booking.isMissingNode() || eventId.isBlank()) {
            throw new IllegalArgumentException("El evento debe incluir payload y eventId");
        }
        if (processedReportEventRepository.existsById(eventId)) return;

        processedReportEventRepository.save(ProcessedReportEvent.builder().eventId(eventId).build());
        String eventType = envelope.path("type").asText();
        String status = booking.path("status").asText();
        String resourceId = booking.path("resourceId").asText("unknown");
        String resourceName = booking.path("resourceName").asText("Recurso " + resourceId);
        String bookingId = booking.path("id").asText(envelope.path("correlationId").asText("unknown"));
        long epochMillis = envelope.path("timestamp").asLong(Instant.now().toEpochMilli());
        Instant capturedAt = Instant.ofEpochMilli(epochMillis);

        if ("BOOKING_CREATED".equals(eventType)) {
            saveMetric("booking_total", "all", 1d, capturedAt);
            saveMetric("bookings_per_hour", HOUR.format(capturedAt), 1d, capturedAt);
            saveMetric("resource_booking_count", resourceId + "|" + resourceName, 1d, capturedAt);
        }
        if (status.isBlank()) throw new IllegalArgumentException("La reserva del evento no contiene status");
        saveMetric("booking_status_count", status, 1d, capturedAt);
        boolean occupied = Set.of("APROBADA", "EN_PREPARACION", "EN_USO").contains(status);
        saveMetric("resource_status", bookingId + "|" + resourceId, occupied ? 1d : 0d, capturedAt);

        if ("DEVUELTA".equals(status)) {
            String createdAt = booking.path("createdAt").asText();
            if (!createdAt.isBlank()) {
                LocalDateTime start = LocalDateTime.parse(createdAt);
                Instant startInstant = start.atZone(ZoneId.systemDefault()).toInstant();
                long cycleMillis = Math.max(0L, Duration.between(startInstant, capturedAt).toMillis());
                saveMetric("cycle_time_ms", resourceId, cycleMillis, capturedAt);
            }
        }
        log.info("Métricas agregadas para eventId={} status={}", eventId, status);
    }

    public Map<String, Double> getKpis(String range) {
        Instant since = cutoff(range);
        Map<String, Double> metrics = new HashMap<>();
        metrics.put("booking_total", sum("booking_total", since));
        metrics.put("booking_status_events", sum("booking_status_count", since));
        List<ReportMetric> cycleTimes = metrics("cycle_time_ms", since);
        metrics.put("average_cycle_time_ms", cycleTimes.stream().mapToDouble(ReportMetric::getValue).average().orElse(0d));

        Map<String, ReportMetric> latestByBooking = new HashMap<>();
        for (ReportMetric metric : reportMetricRepository.findByMetricNameOrderByCapturedAtDesc("resource_status")) {
            String bookingId = metric.getDimension().split("\\|", 2)[0];
            latestByBooking.putIfAbsent(bookingId, metric);
        }
        long occupiedResources = latestByBooking.values().stream()
                .filter(metric -> metric.getValue() > 0d)
                .map(metric -> metric.getDimension().split("\\|", 2))
                .filter(parts -> parts.length == 2)
                .map(parts -> parts[1])
                .distinct()
                .count();
        metrics.put("occupied_resources", (double) occupiedResources);
        return metrics;
    }

    public List<Map<String, Object>> getReservationsPerHour(String range) {
        Map<String, Double> counts = new TreeMap<>();
        metrics("bookings_per_hour", cutoff(range)).forEach(metric ->
                counts.merge(metric.getDimension(), metric.getValue(), Double::sum));
        return counts.entrySet().stream()
                .map(entry -> Map.<String, Object>of("hour", entry.getKey(), "reservations", entry.getValue()))
                .toList();
    }

    public List<Map<String, Object>> getTopResources(String range) {
        Map<String, Double> counts = new HashMap<>();
        metrics("resource_booking_count", cutoff(range)).forEach(metric ->
                counts.merge(metric.getDimension(), metric.getValue(), Double::sum));
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    String[] resource = entry.getKey().split("\\|", 2);
                    return Map.<String, Object>of(
                            "resourceId", resource[0],
                            "resourceName", resource.length == 2 ? resource[1] : resource[0],
                            "reservations", entry.getValue());
                })
                .toList();
    }

    public List<ReportMetric> getMetricsByDimension(String dimension) {
        return reportMetricRepository.findByDimensionOrderByCapturedAtDesc(dimension);
    }

    private List<ReportMetric> metrics(String name, Instant since) {
        return reportMetricRepository.findByMetricNameAndCapturedAtAfterOrderByCapturedAtDesc(name, since);
    }

    private double sum(String name, Instant since) {
        return metrics(name, since).stream().mapToDouble(ReportMetric::getValue).sum();
    }

    private void saveMetric(String name, String dimension, double value, Instant capturedAt) {
        reportMetricRepository.save(ReportMetric.builder()
                .metricName(name)
                .dimension(dimension)
                .value(value)
                .capturedAt(capturedAt)
                .build());
    }

    private Instant cutoff(String range) {
        if (range == null || range.equalsIgnoreCase("all")) return Instant.EPOCH;
        Matcher matcher = RANGE.matcher(range.trim());
        if (!matcher.matches()) throw new IllegalArgumentException("Rango inválido; usa last24h, last7d, last30d o all");
        long amount = Long.parseLong(matcher.group(1));
        if (amount < 1 || amount > 3650) throw new IllegalArgumentException("El rango debe ser de 1 a 3650 horas/días");
        return "h".equalsIgnoreCase(matcher.group(2))
                ? Instant.now().minus(amount, ChronoUnit.HOURS)
                : Instant.now().minus(amount, ChronoUnit.DAYS);
    }
}
