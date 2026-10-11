package com.javier.rabbitadmin.controller;

import java.util.List;
import java.util.Map;
import org.springframework.amqp.rabbit.connection.Connection;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.javier.rabbitadmin.service.RabbitTopology;

@RestController
@RequestMapping("/api/admin/rabbitmq")
public class RabbitAdminController {
    private final ConnectionFactory connectionFactory;
    private final RabbitTopology topology;

    public RabbitAdminController(ConnectionFactory connectionFactory, RabbitTopology topology) {
        this.connectionFactory = connectionFactory;
        this.topology = topology;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        try {
            Connection connection = connectionFactory.createConnection();
            boolean open = connection.isOpen();
            connection.close();
            return Map.of("status", open ? "UP" : "DOWN", "broker", "RabbitMQ");
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "RabbitMQ no disponible");
        }
    }

    @GetMapping("/queues")
    public Map<String, List<String>> queues() {
        return Map.of("queues", List.of("q.cmd.email", "q.cmd.prep", "q.cmd.voucher",
            "q.cmd.email.dlq", "q.cmd.prep.dlq", "q.cmd.voucher.dlq"));
    }

    @PostMapping("/topology/reconcile")
    public Map<String, Object> reconcile() {
        return Map.of("status", "reconciled", "declaredQueues", topology.reconcile());
    }
}
