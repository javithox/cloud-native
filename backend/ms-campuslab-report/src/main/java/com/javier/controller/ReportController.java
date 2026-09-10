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
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Double>> getKpis() {
        return ResponseEntity.ok(reportService.getKpis());
    }

    @GetMapping("/metrics/{dimension}")
    public ResponseEntity<List<ReportMetric>> getMetrics(@PathVariable String dimension) {
        return ResponseEntity.ok(reportService.getMetricsByDimension(dimension));
    }
}
