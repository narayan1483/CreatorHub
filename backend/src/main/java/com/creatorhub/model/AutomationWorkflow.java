package com.creatorhub.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "automation_workflows")
public class AutomationWorkflow {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(nullable = false)
    private String name;

    @Column(name = "trigger_keyword", nullable = false)
    private String triggerKeyword;

    @Column(name = "match_type", nullable = false)
    private String matchType = "contains"; // exact, contains

    @Column(name = "media_id")
    private String mediaId;

    @Column(name = "dm_message_template", nullable = false, columnDefinition = "TEXT")
    private String dmMessageTemplate;

    @Column(name = "public_reply_template", nullable = false, columnDefinition = "TEXT")
    private String publicReplyTemplate;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, PAUSED, DRAFT

    @Column(name = "runs_count", nullable = false)
    private int runsCount = 0;

    @Column(name = "followers_gained", nullable = false)
    private int followersGained = 0;

    @Column(name = "button_clicks", nullable = false)
    private int buttonClicks = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public AutomationWorkflow() {
        this.id = UUID.randomUUID();
    }

    public AutomationWorkflow(Workspace workspace, String name, String triggerKeyword, String dmMessageTemplate, String publicReplyTemplate) {
        this.id = UUID.randomUUID();
        this.workspace = workspace;
        this.name = name;
        this.triggerKeyword = triggerKeyword;
        this.dmMessageTemplate = dmMessageTemplate;
        this.publicReplyTemplate = publicReplyTemplate;
        this.status = "ACTIVE";
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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTriggerKeyword() { return triggerKeyword; }
    public void setTriggerKeyword(String triggerKeyword) { this.triggerKeyword = triggerKeyword; }

    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public String getDmMessageTemplate() { return dmMessageTemplate; }
    public void setDmMessageTemplate(String dmMessageTemplate) { this.dmMessageTemplate = dmMessageTemplate; }

    public String getPublicReplyTemplate() { return publicReplyTemplate; }
    public void setPublicReplyTemplate(String publicReplyTemplate) { this.publicReplyTemplate = publicReplyTemplate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRunsCount() { return runsCount; }
    public void setRunsCount(int runsCount) { this.runsCount = runsCount; }

    public int getFollowersGained() { return followersGained; }
    public void setFollowersGained(int followersGained) { this.followersGained = followersGained; }

    public int getButtonClicks() { return buttonClicks; }
    public void setButtonClicks(int buttonClicks) { this.buttonClicks = buttonClicks; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
