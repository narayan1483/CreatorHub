package com.creatorhub.controller;

import com.creatorhub.dto.meta.InstagramCommentEvent;
import com.creatorhub.kafka.InstagramEventProducer;
import com.creatorhub.model.WebhookEvent;
import com.creatorhub.repository.WebhookEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Official Meta Webhook Controller for Instagram Graph API.
 * Handles webhook challenge verification (GET) and signature-verified event ingestion (POST).
 */
@RestController
@RequestMapping("/api/v1/webhooks/instagram")
public class MetaWebhookController {

    private static final Logger log = LoggerFactory.getLogger(MetaWebhookController.class);

    private final String verifyToken;
    private final String appSecret;
    private final WebhookEventRepository webhookEventRepository;
    private final InstagramEventProducer eventProducer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MetaWebhookController(
            @Value("${creatorhub.meta.verify-token:creatorhub_meta_verify_token_2026}") String verifyToken,
            @Value("${creatorhub.meta.app-secret:${JWT_SECRET:creatorhub_meta_app_secret_dev}}") String appSecret,
            WebhookEventRepository webhookEventRepository,
            InstagramEventProducer eventProducer) {
        this.verifyToken = verifyToken;
        this.appSecret = appSecret;
        this.webhookEventRepository = webhookEventRepository;
        this.eventProducer = eventProducer;
    }

    /**
     * Official Meta Webhook Verification Endpoint.
     * When configuring webhooks in Meta App Dashboard, Meta sends a GET request to verify ownership.
     */
    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge) {

        log.info("[MetaWebhook] Verification request received. mode={}, tokenProvided={}", mode, token != null);

        if ("subscribe".equals(mode) && token != null && MessageDigest.isEqual(verifyToken.getBytes(StandardCharsets.UTF_8), token.getBytes(StandardCharsets.UTF_8))) {
            log.info("[MetaWebhook] Verification successful. Responding with challenge token.");
            return ResponseEntity.ok(challenge);
        }

        log.warn("[MetaWebhook] Verification failed. Invalid verify_token or mode mismatch.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
    }

    /**
     * Official Meta Webhook Ingestion Endpoint.
     * Receives comment and message events. Enforces HMAC-SHA256 signature verification.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleIncomingWebhook(
            @RequestHeader(name = "X-Hub-Signature-256", required = false) String signatureHeader,
            @RequestBody String rawPayload) {

        log.info("[MetaWebhook] Incoming webhook event received. Length: {} bytes", rawPayload.length());

        // 1. Enforce Meta HMAC-SHA256 Signature Verification
        if (!verifyMetaSignature(rawPayload, signatureHeader)) {
            log.warn("[MetaWebhook] Security alert: Rejected webhook with invalid or missing X-Hub-Signature-256");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid HMAC signature");
        }

        // 2. Parse and dispatch events
        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String object = root.path("object").asText();

            if (!"instagram".equalsIgnoreCase(object)) {
                log.info("[MetaWebhook] Ignored non-instagram webhook object: {}", object);
                return ResponseEntity.ok("EVENT_IGNORED");
            }

            JsonNode entries = root.path("entry");
            if (entries.isArray()) {
                for (JsonNode entry : entries) {
                    String pageId = entry.path("id").asText();
                    long time = entry.path("time").asLong(System.currentTimeMillis() / 1000);

                    JsonNode changes = entry.path("changes");
                    if (changes.isArray()) {
                        for (JsonNode change : changes) {
                            String field = change.path("field").asText();
                            if ("comments".equalsIgnoreCase(field)) {
                                processCommentChange(pageId, time, change.path("value"), rawPayload);
                            }
                        }
                    }
                }
            }

            return ResponseEntity.ok("EVENT_RECEIVED");
        } catch (Exception e) {
            log.error("[MetaWebhook] Malformed webhook JSON payload: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Malformed payload");
        }
    }

    private void processCommentChange(String pageId, long timestamp, JsonNode val, String rawPayload) {
        String commentId = val.path("id").asText();
        String commentText = val.path("text").asText();
        String mediaId = val.path("media").path("id").asText();
        String commenterId = val.path("from").path("id").asText();
        String commenterUsername = val.path("from").path("username").asText();

        if (commentId.isBlank() || commentText.isBlank()) {
            return;
        }

        // Idempotency: Reject duplicate deliveries from Meta network
        if (webhookEventRepository.existsByProviderAndEventId("INSTAGRAM", commentId)) {
            log.info("[MetaWebhook] Duplicate event ignored (already recorded): commentId={}", commentId);
            return;
        }

        // Persist incoming audit record
        WebhookEvent webhookEvent = new WebhookEvent("INSTAGRAM", commentId, "comments", rawPayload);
        webhookEventRepository.save(webhookEvent);

        // Construct event DTO and publish to Kafka
        InstagramCommentEvent event = new InstagramCommentEvent(
                commentId,
                mediaId,
                commenterId,
                commenterUsername,
                commentText,
                pageId,
                timestamp,
                false // Live event
        );

        eventProducer.sendCommentEvent(event);
    }

    /**
     * Verifies the X-Hub-Signature-256 header using constant-time comparison.
     */
    public boolean verifyMetaSignature(String payload, String signatureHeader) {
        if (signatureHeader == null || !signatureHeader.startsWith("sha256=")) {
            return false;
        }

        try {
            String expectedHash = signatureHeader.substring("sha256=".length()).trim();

            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKey);

            byte[] computedBytes = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(computedBytes);

            return MessageDigest.isEqual(
                    expectedHash.toLowerCase().getBytes(StandardCharsets.UTF_8),
                    computedHex.toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("[MetaWebhook] Signature calculation failure: {}", e.getMessage());
            return false;
        }
    }
}
