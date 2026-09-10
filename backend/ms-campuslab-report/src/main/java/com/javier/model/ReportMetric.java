package com.javier.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "report_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String metricName;

    @Column(nullable = false)
    private String dimension;

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private Instant capturedAt;

    @PrePersist
    void onCreate() {
        if (capturedAt == null) {
            capturedAt = Instant.now();
        }
    }
}
