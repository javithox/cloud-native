package com.javier.repository;

import com.javier.model.ReportMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportMetricRepository extends JpaRepository<ReportMetric, Long> {

    @Query("SELECT m FROM ReportMetric m WHERE m.metricName = :metricName ORDER BY m.capturedAt DESC")
    List<ReportMetric> findLatestByMetricName(String metricName);

    @Query("SELECT m FROM ReportMetric m WHERE m.dimension = :dimension ORDER BY m.capturedAt DESC")
    List<ReportMetric> findByDimensionOrderByCapturedAtDesc(String dimension);
}
