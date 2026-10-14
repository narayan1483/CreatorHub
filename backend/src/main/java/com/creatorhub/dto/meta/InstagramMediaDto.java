package com.creatorhub.dto.meta;

public record InstagramMediaDto(
        String id,
        String caption,
        String mediaType,
        String mediaUrl,
        String thumbnailUrl,
        String permalink,
        long likeCount,
        long commentsCount,
        String timestamp
) {}
