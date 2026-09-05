package com.javier.model;
import jakarta.persistence.*;

import java.time.LocalDateTime;

public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private Long resourceId; // ID del Laboratorio o Equipo del Catálogo

    @Column(nullable = false)
    private String resourceName;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.SOLICITADA;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public BookingStatus getStatus( BookingStatus status) {
        return getStatus(status);
    }
    public BookingStatus setStatus(BookingStatus newStatus){
        return setStatus(newStatus);
    }
}