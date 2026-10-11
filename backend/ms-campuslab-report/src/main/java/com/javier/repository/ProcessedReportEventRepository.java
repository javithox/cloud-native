package com.javier.repository;

import com.javier.model.ProcessedReportEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessedReportEventRepository extends JpaRepository<ProcessedReportEvent, String> {
}
