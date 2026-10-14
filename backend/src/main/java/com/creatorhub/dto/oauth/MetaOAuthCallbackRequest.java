package com.creatorhub.dto.oauth;

import jakarta.validation.constraints.NotBlank;

public record MetaOAuthCallbackRequest(
        @NotBlank(message = "Authorization code is required")
        String code,

        @NotBlank(message = "State parameter is required for CSRF protection")
        String state
) {}
