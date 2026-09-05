package com.javier.repository;

import com.javier.model.Booking;
import com.javier.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE (:status IS NULL OR b.status = :status) " +
            "AND (:from IS NULL OR b.startTime >= :from) " +
            "AND (:to IS NULL OR b.endTime <= :to)")
    List<Booking> filterBookings(@Param("status") BookingStatus status,
                                 @Param("from") LocalDateTime from,
                                 @Param("to") LocalDateTime to);
}