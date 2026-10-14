package com.creatorhub.service;

import com.creatorhub.dto.meta.InstagramMediaDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resilient Redis Rate Limiter & Webhook Deduplication Service.
 * Protects Instagram accounts from Meta spam rate limits and deduplicates webhooks.
 * Automatically falls back to an in-memory sliding window when Redis is disabled or offline.
 */
@Service
public class RedisRateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RedisRateLimiterService.class);

    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory fallbacks when Redis is disabled or temporarily disconnected
    private final Map<String, Deque<Long>> inMemoryRateLimits = new ConcurrentHashMap<>();
    private final Set<String> inMemoryEventDedup = Collections.newSetFromMap(new ConcurrentHashMap<>());
    private final Map<String, CacheEntry<List<InstagramMediaDto>>> inMemoryMediaCache = new ConcurrentHashMap<>();

    private static class CacheEntry<T> {
        final T data;
        final long expiresAt;

        CacheEntry(T data, long ttlMillis) {
            this.data = data;
            this.expiresAt = System.currentTimeMillis() + ttlMillis;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    public RedisRateLimiterService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            @Value("${creatorhub.redis.enabled:true}") boolean redisEnabled) {
        this.redisTemplate = redisTemplate;
        this.redisEnabled = redisEnabled;
    }

    /**
     * Checks if a key has exceeded maxRequests in the given windowSeconds.
     */
    public boolean isRateLimited(String key, int maxRequests, long windowSeconds) {
        String redisKey = "rate_limit:" + key;

        if (redisEnabled && redisTemplate != null) {
            try {
                Long current = redisTemplate.opsForValue().increment(redisKey);
                if (current != null && current == 1) {
                    redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
                }
                return current != null && current > maxRequests;
            } catch (Exception e) {
                log.warn("[RedisRateLimiter] Redis error: {}. Falling back to in-memory limiter.", e.getMessage());
            }
        }

        // In-memory fallback sliding window
        long now = System.currentTimeMillis();
        long windowMillis = windowSeconds * 1000L;

        Deque<Long> timestamps = inMemoryRateLimits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMillis) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= maxRequests) {
                return true;
            }
            timestamps.addLast(now);
            return false;
        }
    }

    /**
     * Acquires a Meta messaging permit.
     * Enforces Meta messaging threshold (max 50 requests/minute to protect account health).
     */
    public boolean acquireMessagingPermit(String accountId) {
        String key = "instagram:messaging:" + (accountId != null ? accountId : "global");
        boolean limited = isRateLimited(key, 50, 60); // 50 messages per minute
        if (limited) {
            log.warn("[RedisRateLimiter] Rate limit exceeded for Instagram account: {}. Throttling automated reply.", accountId);
            return false;
        }
        return true;
    }

    /**
     * Atomically checks and records an event ID to prevent duplicate processing.
     * Returns true if already processed (duplicate), false if new.
     */
    public boolean isDuplicateWebhook(String eventId) {
        if (eventId == null || eventId.isBlank()) return false;
        String redisKey = "meta:event:dedup:" + eventId;

        if (redisEnabled && redisTemplate != null) {
            try {
                Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "1", Duration.ofHours(24));
                return isNew != null && !isNew;
            } catch (Exception e) {
                log.warn("[RedisRateLimiter] Redis dedup check error: {}. Falling back to in-memory set.", e.getMessage());
            }
        }

        // In-memory fallback
        boolean added = inMemoryEventDedup.add(eventId);
        return !added; // If not added, it was already present -> duplicate
    }

    /**
     * Caches Instagram media items for a creator account with a 10-minute TTL.
     */
    public void cacheMedia(String accountId, List<InstagramMediaDto> media) {
        if (accountId == null || media == null) return;
        String redisKey = "instagram:media:cache:" + accountId;

        if (redisEnabled && redisTemplate != null) {
            try {
                String json = objectMapper.writeValueAsString(media);
                redisTemplate.opsForValue().set(redisKey, json, Duration.ofMinutes(10));
                return;
            } catch (Exception e) {
                log.warn("[RedisRateLimiter] Failed to cache media in Redis: {}", e.getMessage());
            }
        }

        inMemoryMediaCache.put(accountId, new CacheEntry<>(media, 10 * 60 * 1000L));
    }

    /**
     * Retrieves cached Instagram media items if available.
     */
    public List<InstagramMediaDto> getCachedMedia(String accountId) {
        if (accountId == null) return null;
        String redisKey = "instagram:media:cache:" + accountId;

        if (redisEnabled && redisTemplate != null) {
            try {
                String json = redisTemplate.opsForValue().get(redisKey);
                if (json != null && !json.isBlank()) {
                    return objectMapper.readValue(json, new TypeReference<List<InstagramMediaDto>>() {});
                }
            } catch (Exception e) {
                log.warn("[RedisRateLimiter] Failed to retrieve cached media from Redis: {}", e.getMessage());
            }
        }

        CacheEntry<List<InstagramMediaDto>> entry = inMemoryMediaCache.get(accountId);
        if (entry != null && !entry.isExpired()) {
            return entry.data;
        }

        return null;
    }

    /**
     * Returns current Redis health status for the diagnostics dashboard.
     */
    public String getHealthStatus() {
        if (!redisEnabled || redisTemplate == null) {
            return "FALLBACK_IN_MEMORY";
        }
        try {
            String ping = redisTemplate.getConnectionFactory().getConnection().ping();
            return "PONG".equalsIgnoreCase(ping) ? "HEALTHY" : "FALLBACK_IN_MEMORY";
        } catch (Exception e) {
            return "FALLBACK_IN_MEMORY";
        }
    }

    public boolean isRedisEnabled() {
        return redisEnabled;
    }
}
