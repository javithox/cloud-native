package com.javier.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String DLX_EXCHANGE_NAME = "cmd.dead.dlx";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    // -------------------------------------------------------------
    // 1. Declaración del Dead Letter Exchange (DLX)
    // -------------------------------------------------------------
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE_NAME);
    }

    // -------------------------------------------------------------
    // 2. Colas Principales
    // -------------------------------------------------------------
    @Bean
    public Queue emailQueue() {
        return QueueBuilder
                .durable("q.cmd.email")
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE_NAME)
                .withArgument("x-dead-letter-routing-key", "q.cmd.email")
                .build();
    }

    @Bean
    public Queue prepQueue() {
        return QueueBuilder
                .durable("q.cmd.prep")
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE_NAME)
                .withArgument("x-dead-letter-routing-key", "q.cmd.prep")
                .build();
    }

    @Bean
    public Queue voucherQueue() {
        return QueueBuilder
                .durable("q.cmd.voucher")
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE_NAME)
                .withArgument("x-dead-letter-routing-key", "q.cmd.voucher")
                .build();
    }

    // -------------------------------------------------------------
    // 3. Colas DLQ
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 4. Bindings DLQ (Enrutan los mensajes fallidos a su DLQ)
    // -------------------------------------------------------------
    @Bean
    public Binding emailDlqBinding() {
        return BindingBuilder.bind(emailDlq())
                .to(deadLetterExchange())
                .with("q.cmd.email");
    }

    @Bean
    public Binding prepDlqBinding() {
        return BindingBuilder.bind(prepDlq())
                .to(deadLetterExchange())
                .with("q.cmd.prep");
    }

    @Bean
    public Binding voucherDlqBinding() {
        return BindingBuilder.bind(voucherDlq())
                .to(deadLetterExchange())
                .with("q.cmd.voucher");
    }

    // -------------------------------------------------------------
    // 5. Container Factory (Reintentos y descarte a DLQ)
    // -------------------------------------------------------------
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);

        // Intenta procesar el mensaje 3 veces (esperas de 1s, 2s, 4s). 
        // Al agotar los 3 intentos, ejecuta RejectAndDontRequeueRecoverer 
        // lo que envía un NACK con requeue=false a RabbitMQ para enviarlo a la DLQ.
        factory.setAdviceChain(RetryInterceptorBuilder.stateless()
                .maxAttempts(3)
                .backOffOptions(1000, 2.0, 5000)
                .recoverer(new RejectAndDontRequeueRecoverer())
                .build());

        return factory;
    }
}