package com.javier.kafkaadmin.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.stereotype.Service;

@Service
public class KafkaTopicManager {
    private final KafkaAdmin kafkaAdmin;
    private final int partitions;
    private final short replicationFactor;

    public KafkaTopicManager(KafkaAdmin kafkaAdmin,
            @Value("${campuslab.kafka.topic-partitions:3}") int partitions,
            @Value("${campuslab.kafka.topic-replication-factor:3}") short replicationFactor) {
        this.kafkaAdmin = kafkaAdmin;
        this.partitions = partitions;
        this.replicationFactor = replicationFactor;
    }

    public List<String> topics() throws Exception {
        try (AdminClient client = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
            return client.listTopics().names().get(15, TimeUnit.SECONDS).stream().sorted().toList();
        }
    }

    public Map<String, Object> reconcile() throws Exception {
        List<NewTopic> desired = List.of(
            topic("bookings.events", Map.of("cleanup.policy", "delete", "retention.ms", "604800000")),
            topic("audit.timeline", Map.of("cleanup.policy", "compact,delete", "retention.ms", "2592000000")),
            topic("ms-campuslab-audit.DLT", Map.of("cleanup.policy", "delete", "retention.ms", "1209600000")),
            topic("ms-campuslab-report.DLT", Map.of("cleanup.policy", "delete", "retention.ms", "1209600000"))
        );
        try (AdminClient client = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
            Set<String> existing = client.listTopics().names().get(15, TimeUnit.SECONDS);
            List<NewTopic> missing = desired.stream().filter(topic -> !existing.contains(topic.name())).toList();
            if (!missing.isEmpty()) client.createTopics(missing).all().get(30, TimeUnit.SECONDS);
            Map<ConfigResource, Collection<AlterConfigOp>> configChanges = new HashMap<>();
            for (NewTopic topic : desired) {
                ConfigResource resource = new ConfigResource(ConfigResource.Type.TOPIC, topic.name());
                List<AlterConfigOp> operations = topic.configs().entrySet().stream()
                    .map(entry -> new AlterConfigOp(new ConfigEntry(entry.getKey(), entry.getValue()), AlterConfigOp.OpType.SET))
                    .toList();
                configChanges.put(resource, operations);
            }
            client.incrementalAlterConfigs(configChanges).all().get(30, TimeUnit.SECONDS);
            List<String> created = missing.stream().map(NewTopic::name).toList();
            List<String> unchanged = desired.stream().map(NewTopic::name).filter(existing::contains).toList();
            return Map.of("created", created, "alreadyPresent", unchanged, "configsApplied", desired.stream().map(NewTopic::name).toList(),
                "partitions", partitions, "replicationFactor", replicationFactor);
        }
    }

    private NewTopic topic(String name, Map<String, String> configs) {
        return new NewTopic(name, partitions, replicationFactor).configs(configs);
    }
}
