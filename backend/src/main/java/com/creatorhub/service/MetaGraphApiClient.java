package com.creatorhub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Official Meta Graph API Client for Instagram Messaging & Comment Replies.
 * Follows Meta Instagram Messaging API v19.0+ specifications.
 */
@Service
public class MetaGraphApiClient {

    private static final Logger log = LoggerFactory.getLogger(MetaGraphApiClient.class);
    private static final String META_GRAPH_BASE = "https://graph.facebook.com/v19.0";

    private final RestTemplate restTemplate = new RestTemplate();

    public static class DeliveryResult {
        private final boolean success;
        private final boolean dryRun;
        private final String messageId;
        private final String note;

        public DeliveryResult(boolean success, boolean dryRun, String messageId, String note) {
            this.success = success;
            this.dryRun = dryRun;
            this.messageId = messageId;
            this.note = note;
        }

        public boolean isSuccess() { return success; }
        public boolean isDryRun() { return dryRun; }
        public String getMessageId() { return messageId; }
        public String getNote() { return note; }
    }

    /**
     * Dispatches an automated Direct Message to a commenter via Meta Graph API.
     * Policy constraint: Only valid within the 24-hour standard messaging window or as a single response to a user comment.
     *
     * @param pageId The connected Meta Page ID / Instagram Business Account ID
     * @param recipientIgid The recipient's Instagram-scoped ID (IGSID)
     * @param text Message body
     * @param accessToken Decrypted Meta Page access token
     * @param isDryRun When true, simulates without calling external Meta network
     */
    @org.springframework.beans.factory.annotation.Value("${creatorhub.meta.live-mode:false}")
    private boolean liveModeConfigured;

    public DeliveryResult sendDirectMessage(String pageId, String recipientIgid, String text, String accessToken, boolean isDryRun) {
        return sendDirectMessage(pageId, recipientIgid, null, text, accessToken, isDryRun);
    }

    /**
     * Dispatches an automated Direct Message to a commenter via Meta Graph API v19.0.
     * Policy constraint: Single response to comment allowed within 7 days using recipient: { comment_id: id }
     *
     * @param pageId The connected Meta Page ID / Instagram Business Account ID
     * @param recipientIgid The recipient's Instagram-scoped ID (IGSID)
     * @param commentId The comment ID to reply to directly (official Instagram private reply)
     * @param text Message body
     * @param accessToken Decrypted Meta Page access token
     * @param isDryRun When true, simulates without calling external Meta network
     */
    public DeliveryResult sendDirectMessage(String pageId, String recipientIgid, String commentId, String text, String accessToken, boolean isDryRun) {
        boolean effectiveDryRun = isDryRun || !liveModeConfigured || accessToken == null || accessToken.startsWith("demo_") || accessToken.contains("test");

        if (effectiveDryRun) {
            String target = commentId != null ? "comment:" + commentId : "igid:" + recipientIgid;
            log.info("[MetaGraphApi] DRY_RUN simulation active (liveModeConfigured={}). Not sending actual Instagram DM to: {}", liveModeConfigured, target);
            return new DeliveryResult(true, true, "dry_run_mid_" + System.currentTimeMillis(), "Dry-run mode active. No external Meta API called.");
        }

        try {
            String url = META_GRAPH_BASE + "/" + pageId + "/messages";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            Map<String, Object> body = new HashMap<>();
            if (commentId != null && !commentId.isBlank()) {
                // Official Meta API v19.0: Private reply to Instagram comment
                body.put("recipient", Map.of("comment_id", commentId));
            } else {
                body.put("recipient", Map.of("id", recipientIgid));
            }
            body.put("message", Map.of("text", text));
            body.put("messaging_type", "RESPONSE");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String mid = String.valueOf(response.getBody().get("message_id"));
                log.info("[MetaGraphApi] Direct Message successfully delivered via Meta Graph API. message_id: {}", mid);
                return new DeliveryResult(true, false, mid, "Official Meta API delivery confirmed");
            } else {
                return new DeliveryResult(false, false, null, "Meta API returned HTTP " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[MetaGraphApi] Failed to deliver Instagram DM via Meta Graph API: {}", e.getMessage());
            return new DeliveryResult(false, false, null, "Meta API Error: " + e.getMessage());
        }
    }

    /**
     * Posts a public comment reply to acknowledge user comment.
     */
    public DeliveryResult postPublicCommentReply(String commentId, String replyText, String accessToken, boolean isDryRun) {
        if (isDryRun || accessToken == null || accessToken.startsWith("demo_") || accessToken.contains("test")) {
            log.info("[MetaGraphApi] DRY_RUN simulation active. Not posting actual public reply to comment: {}", commentId);
            return new DeliveryResult(true, true, "dry_run_reply_" + System.currentTimeMillis(), "Dry-run mode active.");
        }

        try {
            String url = META_GRAPH_BASE + "/" + commentId + "/replies";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            Map<String, Object> body = Map.of("message", replyText);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String replyId = String.valueOf(response.getBody().get("id"));
                return new DeliveryResult(true, false, replyId, "Public reply posted successfully");
            } else {
                return new DeliveryResult(false, false, null, "Meta API returned HTTP " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[MetaGraphApi] Failed to post public reply: {}", e.getMessage());
            return new DeliveryResult(false, false, null, "Meta API Error: " + e.getMessage());
        }
    }
}
