package com.javier.kafkaadmin.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class KafkaConsumerLagServiceTest {

    @Test
    void shouldCalculatePositiveLag() {
        assertEquals(
                100L,
                KafkaConsumerLagService.calculateLag(200L, 300L));
    }

    @Test
    void shouldReturnZeroWhenConsumerIsUpToDate() {
        assertEquals(
                0L,
                KafkaConsumerLagService.calculateLag(300L, 300L));
    }

    @Test
    void shouldNeverReturnNegativeLag() {
        assertEquals(
                0L,
                KafkaConsumerLagService.calculateLag(350L, 300L));
    }
}
