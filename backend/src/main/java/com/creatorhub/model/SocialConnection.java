package com.creatorhub.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "social_connections",
    uniqueConstraints = @UniqueConstraint(name = "uk_workspace_provider", columnNames = {"workspace_id", "provider"})
)
public class SocialConnection {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(nullable = false)
    private String provider; // INSTAGRAM, FACEBOOK, WHATSAPP

    @Column(name = "account_handle", nullable = false)
    private String accountHandle;

    @Column(name = "provider_account_id", nullable = false)
    private String providerAccountId;

    @Column(name = "encrypted_access_token", nullable = false, columnDefinition = "TEXT")
    private String encryptedAccessToken;

    @Column(name = "token_expires_at")
    private Instant tokenExpiresAt;

    @Column(nullable = false)
    private String status = "CONNECTED"; // CONNECTED, DISCONNECTED, EXPIRED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public SocialConnection() {
        this.id = UUID.randomUUID();
    }

    public SocialConnection(Workspace workspace, String provider, String accountHandle, String providerAccountId, String encryptedAccessToken) {
        this.id = UUID.randomUUID();
        this.workspace = workspace;
        this.provider = provider;
        this.accountHandle = accountHandle;
        this.providerAccountId = providerAccountId;
        this.encryptedAccessToken = encryptedAccessToken;
        this.status = "CONNECTED";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getAccountHandle() { return accountHandle; }
    public void setAccountHandle(String accountHandle) { this.accountHandle = accountHandle; }

    public String getProviderAccountId() { return providerAccountId; }
    public void setProviderAccountId(String providerAccountId) { this.providerAccountId = providerAccountId; }

    public String getEncryptedAccessToken() { return encryptedAccessToken; }
    public void setEncryptedAccessToken(String encryptedAccessToken) { this.encryptedAccessToken = encryptedAccessToken; }

    public Instant getTokenExpiresAt() { return tokenExpiresAt; }
    public void setTokenExpiresAt(Instant tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
