package com.javier.bff.controller;

import java.io.IOException;
import java.net.URI;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@RestController
public class BffProxyController {
    private static final List<String> FORWARDED_REQUEST_HEADERS = List.of(
        HttpHeaders.AUTHORIZATION, HttpHeaders.ACCEPT, HttpHeaders.CONTENT_TYPE,
        "X-Correlation-ID", "X-Request-ID"
    );
    private final RestClient client = RestClient.builder().build();
    private final Map<String, String> serviceBases;

    public BffProxyController(
            @Value("${campuslab.services.bookings}") String bookings,
            @Value("${campuslab.services.catalog}") String catalog,
            @Value("${campuslab.services.audit}") String audit,
            @Value("${campuslab.services.report}") String report,
            @Value("${campuslab.services.rabbitmq-admin}") String rabbitAdmin,
            @Value("${campuslab.services.kafka-admin}") String kafkaAdmin) {
        this.serviceBases = Map.of(
            "bookings", trimSlash(bookings), "catalog", trimSlash(catalog),
            "audit", trimSlash(audit), "report", trimSlash(report),
            "rabbitmqAdmin", trimSlash(rabbitAdmin), "kafkaAdmin", trimSlash(kafkaAdmin));
    }

    @RequestMapping("/api/**")
    public ResponseEntity<byte[]> forward(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        String path = request.getRequestURI();
        String service = routeFor(path);
        if (service == null) return ResponseEntity.notFound().build();
        String query = request.getQueryString();
        URI target = URI.create(serviceBases.get(service) + path + (query == null ? "" : "?" + query));
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        try {
            return client.method(method).uri(target)
                .headers(headers -> copyRequestHeaders(request, headers))
                .body(body == null ? new byte[0] : body)
                .exchange((outgoing, incoming) -> {
                    HttpHeaders responseHeaders = new HttpHeaders();
                    MediaType contentType = incoming.getHeaders().getContentType();
                    if (contentType != null) responseHeaders.setContentType(contentType);
                    for (String name : List.of("Cache-Control", "ETag", "Last-Modified", "Location", "Vary", "X-Correlation-ID")) {
                        List<String> values = incoming.getHeaders().get(name);
                        if (values != null) responseHeaders.put(name, values);
                    }
                    byte[] responseBody;
                    try {
                        responseBody = incoming.getBody().readAllBytes();
                    } catch (IOException e) {
                        throw new IllegalStateException("No se pudo leer la respuesta del servicio", e);
                    }
                    return new ResponseEntity<>(responseBody, responseHeaders, incoming.getStatusCode());
                });
        } catch (RestClientException | IllegalStateException e) {
            return ResponseEntity.status(502).contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":\"Servicio de CampusLab no disponible\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    private void copyRequestHeaders(HttpServletRequest request, HttpHeaders target) {
        for (String name : FORWARDED_REQUEST_HEADERS) {
            Enumeration<String> values = request.getHeaders(name);
            while (values.hasMoreElements()) target.add(name, values.nextElement());
        }
    }

    private String routeFor(String path) {
        if (path.startsWith("/api/admin/rabbitmq")) return "rabbitmqAdmin";
        if (path.startsWith("/api/admin/kafka")) return "kafkaAdmin";
        if (path.startsWith("/api/bookings")) return "bookings";
        if (path.startsWith("/api/catalog")) return "catalog";
        if (path.startsWith("/api/audit")) return "audit";
        if (path.startsWith("/api/report")) return "report";
        return null;
    }

    private static String trimSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
