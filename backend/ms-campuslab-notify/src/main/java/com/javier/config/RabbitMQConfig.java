package com.javier.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    // Cola de Email / Push
    @Bean
    public Queue emailQueue() {
        return QueueBuilder
                .durable("q.cmd.email")
                .build();
    }

    // DLQ de Email / Push
    @Bean
    public Queue emailDlq() {
        return QueueBuilder
                .durable("q.cmd.email.dlq")
                .build();
    }

    // Cola de tickets de preparación
    @Bean
    public Queue prepQueue() {
        return QueueBuilder
                .durable("q.cmd.prep")
                .build();
    }

    // Cola de vouchers / vales
    @Bean
    public Queue voucherQueue() {
        return QueueBuilder
                .durable("q.cmd.voucher")
                .build();
    }
}