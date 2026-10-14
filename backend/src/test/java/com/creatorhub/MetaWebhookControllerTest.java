package com.creatorhub;

import com.creatorhub.controller.MetaWebhookController;
import com.creatorhub.kafka.InstagramEventProducer;
import com.creatorhub.model.WebhookEvent;
import com.creatorhub.repository.WebhookEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MetaWebhookControllerTest {

    private MetaWebhookController controller;
    private WebhookEventRepository webhookEventRepository;
    private InstagramEventProducer eventProducer;

    private final String verifyToken = "test_meta_verify_token_12345";
    private final String appSecret = "test_meta_app_secret_12345";

    @BeforeEach
    void setUp() {
        webhookEventRepository = mock(WebhookEventRepository.class);
        eventProducer = mock(InstagramEventProducer.class);
        controller = new MetaWebhookController(verifyToken, appSecret, webhookEventRepository, eventProducer);
    }

    @Test
    void testWebhookVerificationSuccess() {
        String mode = "subscribe";
        String token = verifyToken;
        String challenge = "1158201444";

        ResponseEntity<String> response = controller.verifyWebhook(mode, token, challenge);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(challenge, response.getBody());
    }

    @Test
    void testWebhookVerificationFailsWithWrongToken() {
        ResponseEntity<String> response = controller.verifyWebhook("subscribe", "wrong_token", "1158201444");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Verification failed", response.getBody());
    }

    @Test
    void testWebhookVerificationFailsWithWrongMode() {
        ResponseEntity<String> response = controller.verifyWebhook("unsubscribe", verifyToken, "1158201444");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void testIncomingWebhookValidSignatureProcessing() throws Exception {
        String payload = """
        {
          "object": "instagram",
          "entry": [
            {
              "id": "17841400000000000",
              "time": 1728888888,
              "changes": [
                {
                  "field": "comments",
                  "value": {
                    "id": "comment_99999",
                    "text": "Send me the BLUEPRINT",
                    "from": {
                      "id": "user_12345",
                      "username": "coder_alex"
                    },
                    "media": {
                      "id": "media_88888"
                    }
                  }
                }
              ]
            }
          ]
        }
        """;

        String signature = computeHmacSha256(payload, appSecret);

        when(webhookEventRepository.existsByProviderAndEventId("INSTAGRAM", "comment_99999")).thenReturn(false);

        ResponseEntity<String> response = controller.handleIncomingWebhook("sha256=" + signature, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("EVENT_RECEIVED", response.getBody());

        verify(webhookEventRepository, times(1)).save(any(WebhookEvent.class));
        verify(eventProducer, times(1)).sendCommentEvent(any());
    }

    @Test
    void testIncomingWebhookInvalidSignatureRejected() {
        String payload = "{\"object\":\"instagram\",\"entry\":[]}";
        String invalidSignature = "sha256=0000000000000000000000000000000000000000000000000000000000000000";

        ResponseEntity<String> response = controller.handleIncomingWebhook(invalidSignature, payload);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Invalid HMAC signature", response.getBody());

        verify(webhookEventRepository, never()).save(any());
        verify(eventProducer, never()).sendCommentEvent(any());
    }

    @Test
    void testIncomingWebhookMissingSignatureRejected() {
        String payload = "{\"object\":\"instagram\",\"entry\":[]}";

        ResponseEntity<String> response = controller.handleIncomingWebhook(null, payload);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(eventProducer, never()).sendCommentEvent(any());
    }

    @Test
    void testIdempotentDeduplicationIgnoresDuplicateEvent() throws Exception {
        String payload = """
        {
          "object": "instagram",
          "entry": [
            {
              "id": "17841400000000000",
              "time": 1728888888,
              "changes": [
                {
                  "field": "comments",
                  "value": {
                    "id": "duplicate_comment_123",
                    "text": "Send me CODE",
                    "from": { "id": "u1", "username": "rohan" },
                    "media": { "id": "m1" }
                  }
                }
              ]
            }
          ]
        }
        """;

        String signature = computeHmacSha256(payload, appSecret);

        // Simulate event already saved previously in DB
        when(webhookEventRepository.existsByProviderAndEventId("INSTAGRAM", "duplicate_comment_123")).thenReturn(true);

        ResponseEntity<String> response = controller.handleIncomingWebhook("sha256=" + signature, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Must NOT re-publish to Kafka
        verify(eventProducer, never()).sendCommentEvent(any());
    }

    private String computeHmacSha256(String data, String secret) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmac.init(secretKey);
        byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
