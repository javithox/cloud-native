package com.javier.kafkaadmin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class KafkaTopicStartupReconciler implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(KafkaTopicStartupReconciler.class);
    private final KafkaTopicManager topicManager;

    public KafkaTopicStartupReconciler(KafkaTopicManager topicManager) {
        this.topicManager = topicManager;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Topología Kafka reconciliada al iniciar: {}", topicManager.reconcile());
        } catch (Exception exception) {
            log.warn("No se pudo reconciliar Kafka al iniciar; se puede reintentar con POST /api/admin/kafka/topics/reconcile", exception);
        }
    }
}
