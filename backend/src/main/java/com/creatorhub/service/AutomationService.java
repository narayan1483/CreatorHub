package com.creatorhub.service;

import com.creatorhub.dto.autodm.AutomationWorkflowDto;
import com.creatorhub.dto.autodm.CreateWorkflowRequest;
import com.creatorhub.dto.autodm.SimulateCommentRequest;
import com.creatorhub.dto.autodm.SimulationResultDto;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.exception.ResourceNotFoundException;
import com.creatorhub.model.AutomationExecution;
import com.creatorhub.model.AutomationWorkflow;
import com.creatorhub.model.Workspace;
import com.creatorhub.repository.AutomationExecutionRepository;
import com.creatorhub.repository.AutomationWorkflowRepository;
import org.springframework.stereotype.Service;
import com.creatorhub.dto.meta.InstagramCommentEvent;
import com.creatorhub.model.SocialConnection;
import com.creatorhub.model.WebhookEvent;
import com.creatorhub.repository.SocialConnectionRepository;
import com.creatorhub.repository.WebhookEventRepository;
import com.creatorhub.security.TokenEncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AutomationService {

    private static final Logger log = LoggerFactory.getLogger(AutomationService.class);

    private final AutomationWorkflowRepository workflowRepository;
    private final AutomationExecutionRepository executionRepository;
    private final WorkspaceService workspaceService;
    private final SocialConnectionRepository socialConnectionRepository;
    private final TokenEncryptionService tokenEncryptionService;
    private final MetaGraphApiClient metaGraphApiClient;
    private final WebhookEventRepository webhookEventRepository;

    public AutomationService(
            AutomationWorkflowRepository workflowRepository,
            AutomationExecutionRepository executionRepository,
            WorkspaceService workspaceService,
            SocialConnectionRepository socialConnectionRepository,
            TokenEncryptionService tokenEncryptionService,
            MetaGraphApiClient metaGraphApiClient,
            WebhookEventRepository webhookEventRepository) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
        this.workspaceService = workspaceService;
        this.socialConnectionRepository = socialConnectionRepository;
        this.tokenEncryptionService = tokenEncryptionService;
        this.metaGraphApiClient = metaGraphApiClient;
        this.webhookEventRepository = webhookEventRepository;
    }

    @Transactional(readOnly = true)
    public List<AutomationWorkflowDto> getWorkflows(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        return workflowRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AutomationWorkflowDto createWorkflow(UUID workspaceId, UUID userId, CreateWorkflowRequest request) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);

        AutomationWorkflow workflow = new AutomationWorkflow(
                workspace,
                request.getName(),
                request.getTriggerKeyword().trim().toUpperCase(),
                request.getDmMessageTemplate(),
                request.getPublicReplyTemplate()
        );
        workflow.setMatchType(request.getMatchType() != null ? request.getMatchType() : "contains");
        workflow = workflowRepository.save(workflow);

        return mapToDto(workflow);
    }

    @Transactional
    public AutomationWorkflowDto toggleStatus(UUID workspaceId, UUID userId, UUID workflowId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        AutomationWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Automation workflow not found"));

        if (!workflow.getWorkspace().getId().equals(workspaceId)) {
            throw new BadRequestException("Workflow does not belong to this workspace");
        }

        workflow.setStatus("ACTIVE".equalsIgnoreCase(workflow.getStatus()) ? "PAUSED" : "ACTIVE");
        workflow = workflowRepository.save(workflow);
        return mapToDto(workflow);
    }

    @Transactional
    public SimulationResultDto simulateComment(UUID workspaceId, SimulateCommentRequest request) {
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);
        List<AutomationWorkflow> activeWorkflows = workflowRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

        String commentUpper = request.getCommentText().trim().toUpperCase();

        for (AutomationWorkflow wf : activeWorkflows) {
            if (!"ACTIVE".equalsIgnoreCase(wf.getStatus())) continue;

            boolean match = "exact".equalsIgnoreCase(wf.getMatchType())
                    ? commentUpper.equals(wf.getTriggerKeyword())
                    : commentUpper.contains(wf.getTriggerKeyword());

            if (match) {
                // Update workflow run stats
                wf.setRunsCount(wf.getRunsCount() + 1);
                wf.setFollowersGained(wf.getFollowersGained() + 1);
                wf.setButtonClicks(wf.getButtonClicks() + 1);
                workflowRepository.save(wf);

                // Personalize templates
                String recipient = request.getCommenterHandle() != null ? request.getCommenterHandle() : "follower";
                String publicReply = wf.getPublicReplyTemplate().replace("{{first_name}}", recipient);
                String dm = wf.getDmMessageTemplate()
                        .replace("{{first_name}}", recipient)
                        .replace("{{store_link}}", "https://creatorhub.to/@" + workspace.getSlug());

                // Record execution audit log
                AutomationExecution execution = new AutomationExecution(
                        wf,
                        workspace,
                        "@" + recipient,
                        request.getCommentText(),
                        dm
                );
                executionRepository.save(execution);

                return new SimulationResultDto(
                        true,
                        wf.getId(),
                        wf.getName(),
                        wf.getTriggerKeyword(),
                        publicReply,
                        dm
                );
            }
        }

        return SimulationResultDto.notMatched();
    }

    @Transactional
    public void processCommentEvent(InstagramCommentEvent event) {
        log.info("[AutomationService] Processing comment event: id={}, text='{}', pageId={}",
                event.getEventId(), event.getCommentText(), event.getInstagramAccountId());

        // 1. Resolve workspace
        Workspace targetWorkspace = null;
        String decryptedAccessToken = null;

        Optional<SocialConnection> connOpt = socialConnectionRepository
                .findByProviderAndProviderAccountId("INSTAGRAM", event.getInstagramAccountId());

        if (connOpt.isPresent()) {
            SocialConnection conn = connOpt.get();
            targetWorkspace = conn.getWorkspace();
            try {
                decryptedAccessToken = tokenEncryptionService.decrypt(conn.getEncryptedAccessToken());
            } catch (Exception e) {
                log.warn("[AutomationService] Token decryption failed for connection {}: {}", conn.getId(), e.getMessage());
            }
        }

        // If target workspace not found via connection ID, find by default/first workspace (dev/test fallback)
        if (targetWorkspace == null) {
            targetWorkspace = workspaceService.getWorkspaceEntity(UUID.fromString("b0000000-0000-0000-0000-000000000001"));
        }

        List<AutomationWorkflow> activeWorkflows = workflowRepository
                .findByWorkspaceIdOrderByCreatedAtDesc(targetWorkspace.getId());

        String commentUpper = event.getCommentText() != null ? event.getCommentText().trim().toUpperCase() : "";

        for (AutomationWorkflow wf : activeWorkflows) {
            if (!"ACTIVE".equalsIgnoreCase(wf.getStatus())) continue;

            boolean match = "exact".equalsIgnoreCase(wf.getMatchType())
                    ? commentUpper.equals(wf.getTriggerKeyword())
                    : commentUpper.contains(wf.getTriggerKeyword());

            if (match) {
                log.info("[AutomationService] MATCH FOUND! Workflow='{}', TriggerKeyword='{}'", wf.getName(), wf.getTriggerKeyword());

                // Update workflow telemetry
                wf.setRunsCount(wf.getRunsCount() + 1);
                wf.setFollowersGained(wf.getFollowersGained() + 1);
                wf.setButtonClicks(wf.getButtonClicks() + 1);
                workflowRepository.save(wf);

                // Personalize response templates
                String recipient = event.getCommenterUsername() != null ? event.getCommenterUsername() : "creator";
                String publicReply = wf.getPublicReplyTemplate().replace("{{first_name}}", recipient);
                String dm = wf.getDmMessageTemplate()
                        .replace("{{first_name}}", recipient)
                        .replace("{{store_link}}", "https://creatorhub.to/@" + targetWorkspace.getSlug());

                // Execute via Meta Graph API Client
                boolean isDryRun = event.isDryRun() || decryptedAccessToken == null;
                MetaGraphApiClient.DeliveryResult dmResult = metaGraphApiClient.sendDirectMessage(
                        event.getInstagramAccountId(),
                        event.getCommenterId(),
                        dm,
                        decryptedAccessToken,
                        isDryRun
                );

                if (event.getEventId() != null) {
                    metaGraphApiClient.postPublicCommentReply(
                            event.getEventId(),
                            publicReply,
                            decryptedAccessToken,
                            isDryRun
                    );
                }

                // Record execution audit log
                AutomationExecution execution = new AutomationExecution(
                        wf,
                        targetWorkspace,
                        "@" + recipient,
                        event.getCommentText(),
                        dm
                );
                execution.setStatus(dmResult.isDryRun() ? "DRY_RUN" : (dmResult.isSuccess() ? "DELIVERED" : "FAILED"));
                if (!dmResult.isSuccess()) {
                    execution.setErrorMessage(dmResult.getNote());
                }
                executionRepository.save(execution);

                // Mark WebhookEvent as PROCESSED
                webhookEventRepository.findByProviderAndEventId("INSTAGRAM", event.getEventId())
                        .ifPresent(we -> {
                            we.setStatus("PROCESSED");
                            webhookEventRepository.save(we);
                        });

                return;
            }
        }

        log.info("[AutomationService] No active keyword match found for comment: '{}'", event.getCommentText());
    }

    @Transactional(readOnly = true)
    public List<AutomationExecution> getExecutions(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        return executionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    private AutomationWorkflowDto mapToDto(AutomationWorkflow wf) {
        return new AutomationWorkflowDto(
                wf.getId(),
                wf.getName(),
                wf.getTriggerKeyword(),
                wf.getMatchType(),
                wf.getDmMessageTemplate(),
                wf.getPublicReplyTemplate(),
                wf.getStatus(),
                wf.getRunsCount(),
                wf.getFollowersGained(),
                wf.getButtonClicks()
        );
    }
}
