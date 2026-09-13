package com.javier.controller;
import com.javier.dto.CatalogDTOs.*;
import com.javier.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CatalogController {

    private final ResourceService resourceService;

    // GET /api/catalog/resources
    @GetMapping("/resources")
    public ResponseEntity<List<ResourceResponse>> getResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET /api/catalog/resources/{id}
    @GetMapping("/resources/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/catalog/resources
    @PostMapping("/resources")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    // PUT /api/catalog/resources/{id} (cupo/stock)
    @PutMapping("/resources/{id}")
    public ResponseEntity<ResourceResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(resourceService.updateStock(id, request));
    }
}