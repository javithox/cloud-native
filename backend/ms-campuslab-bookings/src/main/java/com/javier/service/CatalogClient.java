package com.javier.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class CatalogClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${campuslab.catalog.base-url:http://localhost:8081}")
    private String catalogBaseUrl;

    public ResourceInfo getResource(Long resourceId) {
        return client().get()
                .uri("/api/catalog/resources/{id}", resourceId)
                .retrieve()
                .body(ResourceInfo.class);
    }

    public void reserve(Long resourceId, int quantity) {
        adjustStock(resourceId, -quantity);
    }

    public void release(Long resourceId, int quantity) {
        adjustStock(resourceId, quantity);
    }

    private void adjustStock(Long resourceId, int quantity) {
        client().put()
                .uri("/api/catalog/resources/{id}", resourceId)
                .body(new StockAdjustment(quantity))
                .retrieve()
                .toBodilessEntity();
    }

    private RestClient client() {
        return restClientBuilder.baseUrl(catalogBaseUrl).build();
    }

    public record ResourceInfo(Long id, String code, String name, String description,
                               String type, Integer totalStock, Integer availableStock, Boolean active) {}
    private record StockAdjustment(int quantity) {}
}
