package com.javier.rabbitadmin.service;

import java.util.List;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.stereotype.Service;

@Service
public class RabbitTopology {
    private static final String DIRECT = "cmd.direct";
    private static final String TOPIC = "cmd.topic";
    private static final String DEAD = "cmd.dead.dlx";
    private final RabbitAdmin admin;

    public RabbitTopology(RabbitAdmin admin) {
        this.admin = admin;
    }

    public List<String> reconcile() {
        Exchange direct = new DirectExchange(DIRECT, true, false);
        Exchange topic = new TopicExchange(TOPIC, true, false);
        Exchange dead = new DirectExchange(DEAD, true, false);
        admin.declareExchange(direct);
        admin.declareExchange(topic);
        admin.declareExchange(dead);

        declareFlow("q.cmd.email", "q.cmd.email.dlq", "email.send", "email.*", direct, topic, dead);
        declareFlow("q.cmd.prep", "q.cmd.prep.dlq", "prep.ticket", "prep.#", direct, topic, dead);
        declareFlow("q.cmd.voucher", "q.cmd.voucher.dlq", "voucher.gen", "voucher.*", direct, topic, dead);
        return List.of("q.cmd.email", "q.cmd.prep", "q.cmd.voucher",
            "q.cmd.email.dlq", "q.cmd.prep.dlq", "q.cmd.voucher.dlq");
    }

    private void declareFlow(String queueName, String dlqName, String directKey, String topicKey,
                             Exchange direct, Exchange topic, Exchange dead) {
        Queue queue = QueueBuilder.durable(queueName)
            .withArgument("x-dead-letter-exchange", DEAD)
            .withArgument("x-dead-letter-routing-key", queueName)
            .build();
        Queue dlq = QueueBuilder.durable(dlqName).build();
        admin.declareQueue(queue);
        admin.declareQueue(dlq);
        admin.declareBinding(BindingBuilder.bind(queue).to((DirectExchange) direct).with(directKey));
        admin.declareBinding(BindingBuilder.bind(queue).to((TopicExchange) topic).with(topicKey));
        admin.declareBinding(BindingBuilder.bind(dlq).to((DirectExchange) dead).with(queueName));
    }
}
