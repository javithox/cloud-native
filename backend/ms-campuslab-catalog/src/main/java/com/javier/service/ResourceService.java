package com.javier.service;
import com.javier.dto.CatalogDTOs.*;
import com.javier.model.Resource;
import com.javier.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional
    public ResourceResponse createResource(CreateResourceRequest request) {
        if (resourceRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un recurso con el código: " + request.getCode());
        }

        Resource resource = Resource.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .totalStock(request.getTotalStock())
                .availableStock(request.getTotalStock())
                .active(true)
                .build();

        return mapToResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse updateStock(Long id, UpdateStockRequest request) {
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
        return mapToResponse(resourceRepository.save(resource));
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
