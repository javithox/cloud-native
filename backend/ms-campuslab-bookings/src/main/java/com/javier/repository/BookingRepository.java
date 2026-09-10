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

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resourceId = :resourceId " +
            "AND b.status NOT IN :excludedStatuses " +
            "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsOverlappingBooking(@Param("resourceId") Long resourceId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime,
                                     @Param("excludedStatuses") List<BookingStatus> excludedStatuses);

    List<Booking> findAllByOrderByStartTimeAsc();

    List<Booking> findByStatusOrderByStartTimeAsc(BookingStatus status);

    List<Booking> findByStartTimeGreaterThanEqualAndEndTimeLessThanEqualOrderByStartTimeAsc(
            LocalDateTime from, LocalDateTime to);

    List<Booking> findByStatusAndStartTimeGreaterThanEqualAndEndTimeLessThanEqualOrderByStartTimeAsc(
            BookingStatus status, LocalDateTime from, LocalDateTime to);
}
