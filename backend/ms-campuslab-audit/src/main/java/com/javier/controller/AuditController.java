package com.javier.controller;

import com.javier.model.AuditEvent;
import com.javier.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/timeline")
    public ResponseEntity<List<AuditEvent>> getTimeline() {
        return ResponseEntity.ok(auditService.getAuditTimeline());
    }

    @GetMapping("/correlation/{correlationId}")
    public ResponseEntity<List<AuditEvent>> getByCorrelationId(@PathVariable String correlationId) {
        return ResponseEntity.ok(auditService.getAuditByCorrelationId(correlationId));
    }
}
