package com.creatorhub.kafka;

import com.creatorhub.dto.meta.InstagramCommentEvent;
import com.creatorhub.service.AutomationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Apache Kafka Consumer for Instagram comment events.
 * Listens to topic "instagram.comments", executes matching AutoDM workflows,
 * triggers AI response generators, and updates execution telemetry.
 */
@Component
@ConditionalOnProperty(name = "creatorhub.kafka.enabled", havingValue = "true", matchIfMissing = true)
public class InstagramEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(InstagramEventConsumer.class);

    private final AutomationService automationService;

    public InstagramEventConsumer(AutomationService automationService) {
        this.automationService = automationService;
    }

    @KafkaListener(topics = InstagramEventProducer.COMMENTS_TOPIC, groupId = "creatorhub-autodm-group")
    public void consumeCommentEvent(InstagramCommentEvent event) {
        log.info("[KafkaConsumer] Received comment event for processing: id={}, user=@{}, keyword='{}'",
                event.getEventId(), event.getCommenterUsername(), event.getCommentText());

        try {
            automationService.processCommentEvent(event);
        } catch (Exception e) {
            log.error("[KafkaConsumer] Error processing event [{}]: {}", event.getEventId(), e.getMessage(), e);
            // In a production setup with dead-letter topic (DLQ), we route failed messages here
        }
    }
}
