package com.creatorhub.controller;

import com.creatorhub.dto.autodm.InstagramDiagnosticsDto;
import com.creatorhub.dto.common.ApiResponse;
import com.creatorhub.dto.oauth.MetaAuthorizeUrlResponse;
import com.creatorhub.dto.oauth.MetaOAuthCallbackRequest;
import com.creatorhub.security.UserPrincipal;
import com.creatorhub.service.InstagramOAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/oauth/instagram")
public class InstagramOAuthController {

    private final InstagramOAuthService oAuthService;

    public InstagramOAuthController(InstagramOAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping("/authorize")
    public ResponseEntity<ApiResponse<MetaAuthorizeUrlResponse>> getAuthorizationUrl(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MetaAuthorizeUrlResponse response = oAuthService.generateAuthorizationUrl(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Meta OAuth authorization URL generated", response));
    }

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<InstagramDiagnosticsDto>> handleCallback(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody MetaOAuthCallbackRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InstagramDiagnosticsDto diagnostics = oAuthService.handleOAuthCallback(workspaceId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Instagram Professional account successfully connected", diagnostics));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<InstagramDiagnosticsDto>> disconnectAccount(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InstagramDiagnosticsDto diagnostics = oAuthService.disconnect(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Instagram account disconnected successfully", diagnostics));
    }
}
