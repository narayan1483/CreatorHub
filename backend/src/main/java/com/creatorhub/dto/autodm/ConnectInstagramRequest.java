package com.creatorhub.dto.autodm;

import jakarta.validation.constraints.NotBlank;

public class ConnectInstagramRequest {

    @NotBlank(message = "Account handle is required")
    private String accountHandle;

    @NotBlank(message = "Provider account ID is required")
    private String providerAccountId;

    private String accessToken;

    private boolean enableLiveMode = false;

    public ConnectInstagramRequest() {}

    public ConnectInstagramRequest(String accountHandle, String providerAccountId, String accessToken) {
        this.accountHandle = accountHandle;
        this.providerAccountId = providerAccountId;
        this.accessToken = accessToken;
    }

    public String getAccountHandle() { return accountHandle; }
    public void setAccountHandle(String accountHandle) { this.accountHandle = accountHandle; }

    public String getProviderAccountId() { return providerAccountId; }
    public void setProviderAccountId(String providerAccountId) { this.providerAccountId = providerAccountId; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public boolean isEnableLiveMode() { return enableLiveMode; }
    public void setEnableLiveMode(boolean enableLiveMode) { this.enableLiveMode = enableLiveMode; }
}
