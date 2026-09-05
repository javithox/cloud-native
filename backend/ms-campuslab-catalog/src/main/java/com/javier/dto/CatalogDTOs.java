package com.javier.dto;


import com.javier.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class CatalogDTOs {

    @Data
    public static class CreateResourceRequest {
        @NotBlank(message = "El código es obligatorio")
        private String code;

        @NotBlank(message = "El nombre es obligatorio")
        private String name;

        private String description;

        @NotNull(message = "El tipo de recurso es obligatorio")
        private ResourceType type;

        @NotNull
        @Min(value = 0, message = "El stock debe ser igual o mayor a 0")
        private Integer totalStock;
    }

    @Data
    public static class UpdateStockRequest {
        @NotNull(message = "La cantidad a ajustar es obligatoria")
        private Integer quantity; // Positivo para devolver, negativo para reservar/descontar
    }

    @Data
    public static class ResourceResponse {
        private Long id;
        private String code;
        private String name;
        private String description;
        private ResourceType type;
        private Integer totalStock;
        private Integer availableStock;
        private Boolean active;
    }
}