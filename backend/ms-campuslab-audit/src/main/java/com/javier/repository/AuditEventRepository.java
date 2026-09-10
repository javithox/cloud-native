package com.javier.repository;

import com.javier.model.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByCorrelationIdOrderByTimestampAsc(String correlationId);
    List<AuditEvent> findAllByOrderByTimestampDesc();
}
