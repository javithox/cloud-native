package com.javier.dto;
import com.javier.model.BookingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class BookingDTOs {

    @Data
    public static class CreateBookingRequest {
        @NotBlank(message = "El ID del estudiante es obligatorio")
        private String studentId;

        @NotBlank(message = "El email del estudiante es obligatorio")
        private String studentEmail;

        @NotNull(message = "El ID del recurso es obligatorio")
        private Long resourceId;

        private String resourceName;

        @NotNull(message = "La fecha de inicio es obligatoria")
        private LocalDateTime startTime;

        @NotNull(message = "La fecha de fin es obligatoria")
        private LocalDateTime endTime;

        private String notes;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "El nuevo estado es obligatorio")
        private BookingStatus status;
        private String operatorId;
        private String reason;
    }

    @Data
    public static class BookingResponse {
        private Long id;
        private String studentId;
        private String studentEmail;
        private Long resourceId;
        private String resourceName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BookingStatus status;
        private String notes;
        private LocalDateTime createdAt;
    }
}
