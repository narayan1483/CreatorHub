package com.creatorhub.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "automation_executions")
public class AutomationExecution {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private AutomationWorkflow workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(name = "recipient_handle", nullable = false)
    private String recipientHandle;

    @Column(name = "trigger_comment", columnDefinition = "TEXT")
    private String triggerComment;

    @Column(name = "sent_dm", columnDefinition = "TEXT")
    private String sentDm;

    @Column(nullable = false)
    private String status = "DELIVERED"; // DELIVERED, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AutomationExecution() {
        this.id = UUID.randomUUID();
    }

    public AutomationExecution(AutomationWorkflow workflow, Workspace workspace, String recipientHandle, String triggerComment, String sentDm) {
        this.id = UUID.randomUUID();
        this.workflow = workflow;
        this.workspace = workspace;
        this.recipientHandle = recipientHandle;
        this.triggerComment = triggerComment;
        this.sentDm = sentDm;
        this.status = "DELIVERED";
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public AutomationWorkflow getWorkflow() { return workflow; }
    public void setWorkflow(AutomationWorkflow workflow) { this.workflow = workflow; }

    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }

    public String getRecipientHandle() { return recipientHandle; }
    public void setRecipientHandle(String recipientHandle) { this.recipientHandle = recipientHandle; }

    public String getTriggerComment() { return triggerComment; }
    public void setTriggerComment(String triggerComment) { this.triggerComment = triggerComment; }

    public String getSentDm() { return sentDm; }
    public void setSentDm(String sentDm) { this.sentDm = sentDm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
