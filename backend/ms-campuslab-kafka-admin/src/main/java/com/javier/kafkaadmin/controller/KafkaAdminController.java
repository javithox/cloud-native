package com.javier.kafkaadmin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.javier.kafkaadmin.service.KafkaConsumerLagService;
import com.javier.kafkaadmin.service.KafkaTopicManager;

@RestController
@RequestMapping("/api/admin/kafka")
public class KafkaAdminController {

    private final KafkaTopicManager manager;
    private final KafkaConsumerLagService consumerLagService;

    public KafkaAdminController(
            KafkaTopicManager manager,
            KafkaConsumerLagService consumerLagService) {
        this.manager = manager;
        this.consumerLagService = consumerLagService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        try {
            manager.topics();
            return Map.of("status", "UP", "broker", "Kafka");
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Kafka no disponible");
        }
    }

    @GetMapping("/topics")
    public Map<String, List<String>> topics() {
        try {
            return Map.of("topics", manager.topics());
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudieron listar los tópicos Kafka");
        }
    }

    @PostMapping("/topics/reconcile")
    public Map<String, Object> reconcile() {
        try {
            return manager.reconcile();
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudieron reconciliar los tópicos Kafka");
        }
    }

    @GetMapping("/consumer-lag")
    public Map<String, Object> consumerLag() {
        try {
            List<Map<String, Object>> lag =
                    consumerLagService.getConsumerLag();

            long totalLag = lag.stream()
                    .map(item -> item.get("lag"))
                    .filter(Number.class::isInstance)
                    .map(Number.class::cast)
                    .mapToLong(Number::longValue)
                    .sum();

            long partitionsWithoutCommittedOffset = lag.stream()
                    .filter(item -> item.get("lag") == null)
                    .count();

            long partitionsWithKnownLag =
                    lag.size() - partitionsWithoutCommittedOffset;

            return Map.of(
                    "status", "UP",
                    "totalLag", totalLag,
                    "partitions", lag.size(),
                    "partitionsWithKnownLag", partitionsWithKnownLag,
                    "partitionsWithoutCommittedOffset",
                            partitionsWithoutCommittedOffset,
                    "consumerLag", lag);
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo consultar el Consumer Lag de Kafka");
        }
    }
}
