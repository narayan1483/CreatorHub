package com.creatorhub.dto.oauth;

public record MetaAuthorizeUrlResponse(
        String authorizationUrl,
        String state,
        String appId,
        String redirectUri
) {}
