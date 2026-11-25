package com.javier.kafkaadmin.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.GroupListing;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.clients.admin.MemberAssignment;
import org.apache.kafka.clients.admin.ListOffsetsResult.ListOffsetsResultInfo;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.GroupType;
import org.apache.kafka.common.TopicPartition;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerLagService {

    private static final int TIMEOUT_SECONDS = 15;

    private final KafkaAdmin kafkaAdmin;

    public KafkaConsumerLagService(KafkaAdmin kafkaAdmin) {
        this.kafkaAdmin = kafkaAdmin;
    }

    static long calculateLag(long committedOffset, long logEndOffset) {
        return Math.max(0L, logEndOffset - committedOffset);
    }

    public List<Map<String, Object>> getConsumerLag() throws Exception {

        List<Map<String, Object>> results = new ArrayList<>();

        try (AdminClient client = AdminClient.create(
                kafkaAdmin.getConfigurationProperties())) {

            Collection<GroupListing> groups =
                    client.listGroups()
                            .all()
                            .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);

            for (GroupListing group : groups) {

                boolean isConsumerGroup = group.type()
                        .map(type -> type == GroupType.CONSUMER
                                || type == GroupType.CLASSIC)
                        .orElse(false);

                if (!isConsumerGroup) {
                    continue;
                }

                String groupId = group.groupId();

                Map<String, ConsumerGroupDescription> descriptions =
                        client.describeConsumerGroups(List.of(groupId))
                                .all()
                                .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);

                ConsumerGroupDescription description =
                        descriptions.get(groupId);

                if (description == null) {
                    continue;
                }

                Map<TopicPartition, OffsetAndMetadata> committedOffsets =
                        client.listConsumerGroupOffsets(groupId)
                                .partitionsToOffsetAndMetadata()
                                .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);

                Set<TopicPartition> assignedPartitions =
                        new LinkedHashSet<>();

                for (MemberDescription member : description.members()) {
                    MemberAssignment assignment = member.assignment();
                    assignedPartitions.addAll(
                            assignment.topicPartitions());
                }

                Set<TopicPartition> allPartitions =
                        new LinkedHashSet<>(committedOffsets.keySet());

                allPartitions.addAll(assignedPartitions);

                if (allPartitions.isEmpty()) {
                    continue;
                }

                Map<TopicPartition, OffsetSpec> latestRequests =
                        new LinkedHashMap<>();

                allPartitions.forEach(partition ->
                        latestRequests.put(
                                partition, OffsetSpec.latest()));

                Map<TopicPartition, ListOffsetsResultInfo> latestOffsets =
                        client.listOffsets(latestRequests)
                                .all()
                                .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);

                for (TopicPartition partition : allPartitions) {

                    OffsetAndMetadata committed =
                            committedOffsets.get(partition);

                    ListOffsetsResultInfo latest =
                            latestOffsets.get(partition);

                    Long committedOffset = committed == null
                            ? null
                            : committed.offset();

                    Long logEndOffset = latest == null
                            ? null
                            : latest.offset();

                    Long lag = committedOffset == null
                            || logEndOffset == null
                            ? null
                            : calculateLag(
                                    committedOffset, logEndOffset);

                    Map<String, Object> item = new LinkedHashMap<>();

                    item.put("groupId", groupId);
                    item.put("topic", partition.topic());
                    item.put("partition", partition.partition());
                    item.put("committedOffset", committedOffset);
                    item.put("logEndOffset", logEndOffset);
                    item.put("lag", lag);
                    item.put("lagStatus", lag == null
                            ? "NO_COMMITTED_OFFSET"
                            : "OK");
                    item.put("assignmentStatus",
                            assignedPartitions.contains(partition)
                                    ? "ASSIGNED"
                                    : "NOT_CURRENTLY_ASSIGNED");
                    item.put("consumerCount",
                            description.members().size());
                    item.put("consumerGroupState",
                            description.groupState().name());

                    results.add(item);
                }
            }
        }

        return results;
    }
}
