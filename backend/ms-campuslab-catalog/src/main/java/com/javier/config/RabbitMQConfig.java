package com.javier.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${campuslab.rabbitmq.exchanges.direct}")
    private String directExchangeName;

    @Value("${campuslab.rabbitmq.exchanges.topic}")
    private String topicExchangeName;

    @Value("${campuslab.rabbitmq.exchanges.dlx}")
    private String dlxExchangeName;

    // Exchanges
    @Bean
    public DirectExchange directExchange() {
        return new DirectExchange(directExchangeName);
    }

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(topicExchangeName);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(dlxExchangeName);
    }

    // Colas Principales
    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable("q.cmd.email")
                .withArgument("x-dead-letter-exchange", dlxExchangeName)
                .withArgument("x-dead-letter-routing-key", "email.dlq")
                .build();
    }

    @Bean
    public Queue prepQueue() {
        return QueueBuilder.durable("q.cmd.prep")
                .withArgument("x-dead-letter-exchange", dlxExchangeName)
                .withArgument("x-dead-letter-routing-key", "prep.dlq")
                .build();
    }

    @Bean
    public Queue voucherQueue() {
        return QueueBuilder.durable("q.cmd.voucher")
                .withArgument("x-dead-letter-exchange", dlxExchangeName)
                .withArgument("x-dead-letter-routing-key", "voucher.dlq")
                .build();
    }

    // Colas DLQ
    @Bean
    public Queue emailDlq() {
        return QueueBuilder.durable("q.cmd.email.dlq").build();
    }

    @Bean
    public Queue prepDlq() {
        return QueueBuilder.durable("q.cmd.prep.dlq").build();
    }

    @Bean
    public Queue voucherDlq() {
        return QueueBuilder.durable("q.cmd.voucher.dlq").build();
    }

    // Bindings
    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(emailQueue).to(directExchange).with("email.send");
    }

    @Bean
    public Binding prepBinding(Queue prepQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(prepQueue).to(directExchange).with("prep.ticket");
    }

    @Bean
    public Binding voucherBinding(Queue voucherQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(voucherQueue).to(directExchange).with("voucher.gen");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}