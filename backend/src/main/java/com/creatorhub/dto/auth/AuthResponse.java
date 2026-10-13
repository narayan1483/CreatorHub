package com.creatorhub.dto.auth;

import com.creatorhub.dto.workspace.WorkspaceDto;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresInMs;
    private UserSummaryDto user;
    private WorkspaceDto defaultWorkspace;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, long expiresInMs, UserSummaryDto user, WorkspaceDto defaultWorkspace) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.expiresInMs = expiresInMs;
        this.user = user;
        this.defaultWorkspace = defaultWorkspace;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(long expiresInMs) { this.expiresInMs = expiresInMs; }

    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }

    public WorkspaceDto getDefaultWorkspace() { return defaultWorkspace; }
    public void setDefaultWorkspace(WorkspaceDto defaultWorkspace) { this.defaultWorkspace = defaultWorkspace; }
}
