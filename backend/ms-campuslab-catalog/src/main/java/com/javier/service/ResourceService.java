package com.javier.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javier.dto.CatalogDTOs.*;
import com.javier.dto.EventEnvelope;
import com.javier.model.Resource;
import com.javier.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${campuslab.kafka.topics.booking-events:bookings.events}")
    private String bookingEventsTopic;

    @Transactional
    public ResourceResponse createResource(CreateResourceRequest request) {
        String correlationId = "resource-create-" + System.currentTimeMillis();
        try {
            String generatedCode = (request.getCode() == null || request.getCode().isBlank())
                    ? "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
                    : request.getCode();

            if (resourceRepository.findByCode(generatedCode).isPresent()) {
                throw new IllegalArgumentException("Ya existe un recurso con el código: " + generatedCode);
            }

            Resource resource = Resource.builder()
                    .code(generatedCode)
                    .name(request.getName())
                    .description(request.getDescription())
                    .type(request.getType())
                    .totalStock(request.getTotalStock())
                    .availableStock(request.getTotalStock())
                    .active(true)
                    .build();

            ResourceResponse response = mapToResponse(resourceRepository.save(resource));
            publishKafkaEvent("RESOURCE_CREATED", buildResourcePayload(response, "SUCCESS", "Recurso creado correctamente"), correlationId);
            return response;
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("RESOURCE_CREATE_ERROR", buildResourcePayload(null, "ERROR", e.getMessage(), request.getName()), correlationId);
            throw e;
        } catch (Exception e) {
            publishKafkaEvent("RESOURCE_CREATE_ERROR", buildResourcePayload(null, "ERROR", "No se pudo crear el recurso", request.getName()), correlationId);
            log.error("Error inesperado al crear recurso: {}", request.getCode(), e);
            throw e;
        }
    }

    @Transactional
    public ResourceResponse updateStock(Long id, UpdateStockRequest request) {
        String correlationId = "resource-stock-" + id;
        try {
            Resource resource = resourceRepository.findLockedById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Recurso no encontrado con ID: " + id));
            if (!Boolean.TRUE.equals(resource.getActive())) {
                throw new IllegalStateException("El recurso no está activo");
            }

            int newAvailable = resource.getAvailableStock() + request.getQuantity();

            if (newAvailable < 0) {
                throw new IllegalStateException("Stock insuficiente para el recurso: " + resource.getName());
            }
            if (newAvailable > resource.getTotalStock()) {
                throw new IllegalStateException("El stock disponible no puede superar el stock total");
            }

            resource.setAvailableStock(newAvailable);
            ResourceResponse response = mapToResponse(resourceRepository.save(resource));
            publishKafkaEvent("RESOURCE_STOCK_UPDATED", buildResourcePayload(response, "SUCCESS", "Stock actualizado"), correlationId);
            return response;
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("RESOURCE_STOCK_ERROR", buildResourcePayload(null, "ERROR", e.getMessage(), "Recurso " + id), correlationId);
            throw e;
        }
    }

    @Transactional
    public ResourceResponse updateResource(Long id, UpdateResourceRequest request) {
        String correlationId = "resource-update-" + id;
        try {
            Resource resource = resourceRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Recurso no encontrado con ID: " + id));
            if (request.getCode() != null && !request.getCode().isBlank()) resource.setCode(request.getCode());
            if (request.getName() != null && !request.getName().isBlank()) resource.setName(request.getName());
            if (request.getDescription() != null) resource.setDescription(request.getDescription());
            if (request.getType() != null) resource.setType(request.getType());
            if (request.getTotalStock() != null) {
                int delta = request.getTotalStock() - resource.getTotalStock();
                resource.setTotalStock(request.getTotalStock());
                resource.setAvailableStock(Math.max(0, resource.getAvailableStock() + delta));
            }
            ResourceResponse response = mapToResponse(resourceRepository.save(resource));
            publishKafkaEvent("RESOURCE_UPDATED", buildResourcePayload(response, "SUCCESS", "Recurso actualizado"), correlationId);
            return response;
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("RESOURCE_UPDATE_ERROR", buildResourcePayload(null, "ERROR", e.getMessage(), "Recurso " + id), correlationId);
            throw e;
        }
    }

    @Transactional
    public ResourceResponse deleteResource(Long id) {
        String correlationId = "resource-delete-" + id;
        try {
            Resource resource = resourceRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Recurso no encontrado con ID: " + id));
            resource.setActive(false);
            ResourceResponse response = mapToResponse(resourceRepository.save(resource));
            publishKafkaEvent("RESOURCE_DELETED", buildResourcePayload(response, "SUCCESS", "Recurso desactivado"), correlationId);
            return response;
        } catch (IllegalArgumentException | IllegalStateException e) {
            publishKafkaEvent("RESOURCE_DELETE_ERROR", buildResourcePayload(null, "ERROR", e.getMessage(), "Recurso " + id), correlationId);
            throw e;
        }
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ResourceResponse getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Recurso no encontrado"));
    }

    private void publishKafkaEvent(String eventType, Object payload, String correlationId) {
        try {
            EventEnvelope<Object> envelope = EventEnvelope.create(eventType, correlationId, payload);
            String json = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(bookingEventsTopic, correlationId, json);
        } catch (Exception e) {
            log.error("Error publicando evento de auditoría {} para correlationId {}", eventType, correlationId, e);
        }
    }

    private Map<String, Object> buildResourcePayload(ResourceResponse resource, String status, String details) {
        return buildResourcePayload(resource, status, details, resource != null ? resource.getName() : "Recurso");
    }

    private Map<String, Object> buildResourcePayload(ResourceResponse resource, String status, String details, String resourceName) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", status);
        payload.put("details", details);
        payload.put("resourceName", resourceName);
        payload.put("user", "system");
        if (resource != null) {
            payload.put("id", resource.getId());
            payload.put("name", resource.getName());
            payload.put("code", resource.getCode());
            payload.put("type", resource.getType());
        }
        return payload;
    }

    private ResourceResponse mapToResponse(Resource r) {
        ResourceResponse res = new ResourceResponse();
        res.setId(r.getId());
        res.setCode(r.getCode());
        res.setName(r.getName());
        res.setDescription(r.getDescription());
        res.setType(r.getType());
        res.setTotalStock(r.getTotalStock());
        res.setAvailableStock(r.getAvailableStock());
        res.setActive(r.getActive());
        return res;
    }
}
