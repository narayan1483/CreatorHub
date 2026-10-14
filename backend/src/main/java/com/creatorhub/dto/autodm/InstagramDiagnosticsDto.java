package com.creatorhub.dto.autodm;

import java.time.Instant;
import java.util.List;

public class InstagramDiagnosticsDto {
    private boolean connected;
    private String accountHandle;
    private String providerAccountId;
    private String status;
    private boolean tokenConfigured;
    private String tokenMasked;
    private boolean tokenValid;
    private Instant tokenExpiresAt;
    private String dispatchMode;
    private boolean liveModeEnabled;
    private WebhookDiagnostics webhook;
    private KafkaDiagnostics kafka;
    private EngineDiagnostics engine;
    private List<PermissionStatus> permissions;
    private List<String> setupChecklist;

    public InstagramDiagnosticsDto() {}

    public static class WebhookDiagnostics {
        private String url;
        private boolean verifyTokenConfigured;
        private boolean appSecretConfigured;
        private List<String> subscribedFields;
        private String signatureAlgorithm;
        private String reachabilityStatus;

        public WebhookDiagnostics(String url, boolean verifyTokenConfigured, boolean appSecretConfigured,
                                  List<String> subscribedFields, String signatureAlgorithm, String reachabilityStatus) {
            this.url = url;
            this.verifyTokenConfigured = verifyTokenConfigured;
            this.appSecretConfigured = appSecretConfigured;
            this.subscribedFields = subscribedFields;
            this.signatureAlgorithm = signatureAlgorithm;
            this.reachabilityStatus = reachabilityStatus;
        }

        public String getUrl() { return url; }
        public boolean isVerifyTokenConfigured() { return verifyTokenConfigured; }
        public boolean isAppSecretConfigured() { return appSecretConfigured; }
        public List<String> getSubscribedFields() { return subscribedFields; }
        public String getSignatureAlgorithm() { return signatureAlgorithm; }
        public String getReachabilityStatus() { return reachabilityStatus; }
    }

    public static class KafkaDiagnostics {
        private String brokerStatus;
        private boolean consumerActive;
        private String topic;
        private boolean fallbackQueueActive;

        public KafkaDiagnostics(String brokerStatus, boolean consumerActive, String topic, boolean fallbackQueueActive) {
            this.brokerStatus = brokerStatus;
            this.consumerActive = consumerActive;
            this.topic = topic;
            this.fallbackQueueActive = fallbackQueueActive;
        }

        public String getBrokerStatus() { return brokerStatus; }
        public boolean isConsumerActive() { return consumerActive; }
        public String getTopic() { return topic; }
        public boolean isFallbackQueueActive() { return fallbackQueueActive; }
    }

    public static class EngineDiagnostics {
        private int activeWorkflowsCount;
        private int totalExecutionsCount;
        private List<String> matchTypesSupported;

        public EngineDiagnostics(int activeWorkflowsCount, int totalExecutionsCount, List<String> matchTypesSupported) {
            this.activeWorkflowsCount = activeWorkflowsCount;
            this.totalExecutionsCount = totalExecutionsCount;
            this.matchTypesSupported = matchTypesSupported;
        }

        public int getActiveWorkflowsCount() { return activeWorkflowsCount; }
        public int getTotalExecutionsCount() { return totalExecutionsCount; }
        public List<String> getMatchTypesSupported() { return matchTypesSupported; }
    }

    public static class PermissionStatus {
        private String permission;
        private boolean required;
        private boolean granted;
        private String description;

        public PermissionStatus(String permission, boolean required, boolean granted, String description) {
            this.permission = permission;
            this.required = required;
            this.granted = granted;
            this.description = description;
        }

        public String getPermission() { return permission; }
        public boolean isRequired() { return required; }
        public boolean isGranted() { return granted; }
        public String getDescription() { return description; }
    }

    // Getters and Setters
    public boolean isConnected() { return connected; }
    public void setConnected(boolean connected) { this.connected = connected; }

    public String getAccountHandle() { return accountHandle; }
    public void setAccountHandle(String accountHandle) { this.accountHandle = accountHandle; }

    public String getProviderAccountId() { return providerAccountId; }
    public void setProviderAccountId(String providerAccountId) { this.providerAccountId = providerAccountId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isTokenConfigured() { return tokenConfigured; }
    public void setTokenConfigured(boolean tokenConfigured) { this.tokenConfigured = tokenConfigured; }

    public String getTokenMasked() { return tokenMasked; }
    public void setTokenMasked(String tokenMasked) { this.tokenMasked = tokenMasked; }

    public boolean isTokenValid() { return tokenValid; }
    public void setTokenValid(boolean tokenValid) { this.tokenValid = tokenValid; }

    public Instant getTokenExpiresAt() { return tokenExpiresAt; }
    public void setTokenExpiresAt(Instant tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }

    public String getDispatchMode() { return dispatchMode; }
    public void setDispatchMode(String dispatchMode) { this.dispatchMode = dispatchMode; }

    public boolean isLiveModeEnabled() { return liveModeEnabled; }
    public void setLiveModeEnabled(boolean liveModeEnabled) { this.liveModeEnabled = liveModeEnabled; }

    public WebhookDiagnostics getWebhook() { return webhook; }
    public void setWebhook(WebhookDiagnostics webhook) { this.webhook = webhook; }

    public KafkaDiagnostics getKafka() { return kafka; }
    public void setKafka(KafkaDiagnostics kafka) { this.kafka = kafka; }

    public EngineDiagnostics getEngine() { return engine; }
    public void setEngine(EngineDiagnostics engine) { this.engine = engine; }

    public List<PermissionStatus> getPermissions() { return permissions; }
    public void setPermissions(List<PermissionStatus> permissions) { this.permissions = permissions; }

    public List<String> getSetupChecklist() { return setupChecklist; }
    public void setSetupChecklist(List<String> setupChecklist) { this.setupChecklist = setupChecklist; }
}
