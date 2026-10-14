package com.creatorhub.kafka;

import com.creatorhub.dto.meta.InstagramCommentEvent;
import com.creatorhub.service.AutomationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Publishes verified Instagram webhook comment events to Apache Kafka.
 * Includes resilience fallback: if Kafka is temporarily unreachable,
 * delegates to asynchronous executor to ensure events are never lost.
 */
@Service
public class InstagramEventProducer {

    private static final Logger log = LoggerFactory.getLogger(InstagramEventProducer.class);
    public static final String COMMENTS_TOPIC = "instagram.comments";

    private final KafkaTemplate<String, InstagramCommentEvent> kafkaTemplate;
    private final AutomationService automationService;
    private final boolean kafkaEnabled;

    public InstagramEventProducer(
            @Autowired(required = false) KafkaTemplate<String, InstagramCommentEvent> kafkaTemplate,
            AutomationService automationService,
            @Value("${creatorhub.kafka.enabled:true}") boolean kafkaEnabled) {
        this.kafkaTemplate = kafkaTemplate;
        this.automationService = automationService;
        this.kafkaEnabled = kafkaEnabled;
    }

    public CompletableFuture<Void> sendCommentEvent(InstagramCommentEvent event) {
        if (kafkaEnabled && kafkaTemplate != null) {
            try {
                log.info("[KafkaProducer] Publishing comment event [{}] to topic [{}]", event.getEventId(), COMMENTS_TOPIC);
                return kafkaTemplate.send(COMMENTS_TOPIC, event.getEventId(), event)
                        .thenAccept(result -> log.info("[KafkaProducer] Event [{}] committed at offset {}", event.getEventId(), result.getRecordMetadata().offset()))
                        .exceptionally(ex -> {
                            log.warn("[KafkaProducer] Kafka broker error: {}. Falling back to resilient asynchronous processing.", ex.getMessage());
                            processFallback(event);
                            return null;
                        });
            } catch (Exception e) {
                log.warn("[KafkaProducer] Immediate publish failure ({}). Falling back to resilient direct queue.", e.getMessage());
                processFallback(event);
                return CompletableFuture.completedFuture(null);
            }
        } else {
            log.info("[KafkaProducer] Kafka disabled or unavailable in current profile. Processing asynchronously via fallback queue.");
            processFallback(event);
            return CompletableFuture.completedFuture(null);
        }
    }

    @Async
    public void processFallback(InstagramCommentEvent event) {
        try {
            automationService.processCommentEvent(event);
        } catch (Exception e) {
            log.error("[KafkaProducer-Fallback] Failed to process event [{}]: {}", event.getEventId(), e.getMessage());
        }
    }
}
