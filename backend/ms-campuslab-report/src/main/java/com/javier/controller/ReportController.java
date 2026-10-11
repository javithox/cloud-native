package com.javier.controller;

import com.javier.model.ReportMetric;
import com.javier.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Double>> getKpis(@RequestParam(defaultValue = "last24h") String range) {
        return ResponseEntity.ok(reportService.getKpis(range));
    }

    @GetMapping("/reservations-per-hour")
    public ResponseEntity<List<Map<String, Object>>> getReservationsPerHour(
            @RequestParam(defaultValue = "last24h") String range) {
        return ResponseEntity.ok(reportService.getReservationsPerHour(range));
    }

    @GetMapping("/top-resources")
    public ResponseEntity<List<Map<String, Object>>> getTopResources(
            @RequestParam(defaultValue = "last7d") String range) {
        return ResponseEntity.ok(reportService.getTopResources(range));
    }

    @GetMapping("/metrics/{dimension}")
    public ResponseEntity<List<ReportMetric>> getMetrics(@PathVariable String dimension) {
        return ResponseEntity.ok(reportService.getMetricsByDimension(dimension));
    }
}
