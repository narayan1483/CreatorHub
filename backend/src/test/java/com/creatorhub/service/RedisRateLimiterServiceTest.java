package com.creatorhub.service;

import com.creatorhub.dto.meta.InstagramMediaDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RedisRateLimiterServiceTest {

    private RedisRateLimiterService service;

    @BeforeEach
    void setUp() {
        // Test resilient in-memory sliding window fallback (no redis server needed)
        service = new RedisRateLimiterService(null, false);
    }

    @Test
    @DisplayName("Should enforce in-memory rate limiting within window")
    void testRateLimiterSlidingWindow() {
        String key = "test_key_1";
        // Allow up to 3 requests in 10 seconds
        assertFalse(service.isRateLimited(key, 3, 10)); // 1st
        assertFalse(service.isRateLimited(key, 3, 10)); // 2nd
        assertFalse(service.isRateLimited(key, 3, 10)); // 3rd
        assertTrue(service.isRateLimited(key, 3, 10));  // 4th -> rate limited!
    }

    @Test
    @DisplayName("Should enforce messaging permit for Meta account")
    void testMessagingPermit() {
        String accountId = "17841499999999999";
        for (int i = 0; i < 50; i++) {
            assertTrue(service.acquireMessagingPermit(accountId), "Permit " + (i + 1) + " should be granted");
        }
        // 51st request exceeds 50 req/min limit
        assertFalse(service.acquireMessagingPermit(accountId), "51st permit should be throttled");
    }

    @Test
    @DisplayName("Should detect duplicate webhooks atomically")
    void testWebhookDeduplication() {
        String eventId = "evt_unique_123456";
        assertFalse(service.isDuplicateWebhook(eventId), "First time should not be duplicate");
        assertTrue(service.isDuplicateWebhook(eventId), "Second time must be marked as duplicate");
    }

    @Test
    @DisplayName("Should cache and retrieve Instagram media in-memory")
    void testMediaCaching() {
        String accountId = "ig_acc_media_test";
        InstagramMediaDto item = new InstagramMediaDto(
                "post_123", "Learn System Design", "IMAGE", "https://img.com/1", null, "https://instagr.am/p/1",
                150L, 25L, "2026-10-14T10:00:00Z"
        );
        service.cacheMedia(accountId, List.of(item));

        List<InstagramMediaDto> cached = service.getCachedMedia(accountId);
        assertNotNull(cached);
        assertEquals(1, cached.size());
        assertEquals("post_123", cached.get(0).id());
        assertEquals("Learn System Design", cached.get(0).caption());
    }

    @Test
    @DisplayName("Should report in-memory fallback health when Redis is offline or disabled")
    void testHealthStatusFallback() {
        assertEquals("FALLBACK_IN_MEMORY", service.getHealthStatus());
    }
}
