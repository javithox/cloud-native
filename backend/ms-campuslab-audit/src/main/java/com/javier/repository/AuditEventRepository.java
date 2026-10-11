package com.javier.repository;

import com.javier.model.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    Optional<AuditEvent> findByEventId(String eventId);
    List<AuditEvent> findByCorrelationIdOrderByTimestampAsc(String correlationId);
    List<AuditEvent> findAllByOrderByTimestampDesc();
}
