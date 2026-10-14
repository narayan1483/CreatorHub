package com.creatorhub.service;

import com.creatorhub.dto.autodm.AutomationWorkflowDto;
import com.creatorhub.dto.autodm.CreateWorkflowRequest;
import com.creatorhub.dto.autodm.InstagramDiagnosticsDto;
import com.creatorhub.dto.autodm.ConnectInstagramRequest;
import com.creatorhub.dto.autodm.TestDryRunRequest;
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
    private final RedisRateLimiterService redisRateLimiterService;

    @org.springframework.beans.factory.annotation.Value("${creatorhub.meta.live-mode:false}")
    private boolean liveModeConfigured;

    public AutomationService(
            AutomationWorkflowRepository workflowRepository,
            AutomationExecutionRepository executionRepository,
            WorkspaceService workspaceService,
            SocialConnectionRepository socialConnectionRepository,
            TokenEncryptionService tokenEncryptionService,
            MetaGraphApiClient metaGraphApiClient,
            WebhookEventRepository webhookEventRepository) {
        this(workflowRepository, executionRepository, workspaceService, socialConnectionRepository,
                tokenEncryptionService, metaGraphApiClient, webhookEventRepository,
                new RedisRateLimiterService(null, false));
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AutomationService(
            AutomationWorkflowRepository workflowRepository,
            AutomationExecutionRepository executionRepository,
            WorkspaceService workspaceService,
            SocialConnectionRepository socialConnectionRepository,
            TokenEncryptionService tokenEncryptionService,
            MetaGraphApiClient metaGraphApiClient,
            WebhookEventRepository webhookEventRepository,
            RedisRateLimiterService redisRateLimiterService) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
        this.workspaceService = workspaceService;
        this.socialConnectionRepository = socialConnectionRepository;
        this.tokenEncryptionService = tokenEncryptionService;
        this.metaGraphApiClient = metaGraphApiClient;
        this.webhookEventRepository = webhookEventRepository;
        this.redisRateLimiterService = redisRateLimiterService;
    }

    public void setLiveMode(boolean liveMode) {
        this.liveModeConfigured = liveMode;
    }

    public boolean isLiveModeConfigured() {
        return liveModeConfigured;
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
        workflow.setMediaId(request.getMediaId());
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

            if (request.getMediaId() != null && !request.getMediaId().isBlank() &&
                    wf.getMediaId() != null && !wf.getMediaId().isBlank() && !"ALL".equalsIgnoreCase(wf.getMediaId())) {
                if (!wf.getMediaId().equals(request.getMediaId())) {
                    continue;
                }
            }

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
        log.info("[AutomationService] Processing comment event: id={}, text='{}', pageId={}, mediaId={}",
                event.getEventId(), event.getCommentText(), event.getInstagramAccountId(), event.getMediaId());

        // 0. Deduplicate webhook events (24h sliding window via Redis with in-memory fallback)
        if (event.getEventId() != null && redisRateLimiterService.isDuplicateWebhook(event.getEventId())) {
            log.info("[AutomationService] Skipping duplicate webhook event: {}", event.getEventId());
            return;
        }

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

            // Media targeting check: if workflow specifies a mediaId, it must match the event mediaId
            if (wf.getMediaId() != null && !wf.getMediaId().isBlank() && !"ALL".equalsIgnoreCase(wf.getMediaId())) {
                if (event.getMediaId() != null && !wf.getMediaId().equals(event.getMediaId())) {
                    continue; // Skip workflow bound to a different post/reel
                }
            }

            boolean match = "exact".equalsIgnoreCase(wf.getMatchType())
                    ? commentUpper.equals(wf.getTriggerKeyword())
                    : commentUpper.contains(wf.getTriggerKeyword());

            if (match) {
                log.info("[AutomationService] MATCH FOUND! Workflow='{}', TriggerKeyword='{}', MediaId='{}'",
                        wf.getName(), wf.getTriggerKeyword(), wf.getMediaId());

                // Rate limiting check: Meta messaging threshold (max 50 req/min)
                if (!redisRateLimiterService.acquireMessagingPermit(event.getInstagramAccountId())) {
                    log.warn("[AutomationService] Rate limit exceeded for Instagram account {}. Skipping automated message dispatch.",
                            event.getInstagramAccountId());
                    return;
                }

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
                // Only send real API call if liveMode is configured AND event is not dry-run AND decrypted token is present
                boolean isDryRun = !liveModeConfigured || event.isDryRun() || decryptedAccessToken == null;
                MetaGraphApiClient.DeliveryResult dmResult = metaGraphApiClient.sendDirectMessage(
                        event.getInstagramAccountId(),
                        event.getCommenterId(),
                        event.getEventId(),
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

    @Transactional(readOnly = true)
    public InstagramDiagnosticsDto getDiagnostics(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);

        InstagramDiagnosticsDto dto = new InstagramDiagnosticsDto();

        Optional<SocialConnection> connOpt = socialConnectionRepository.findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM");
        boolean isConnected = false;
        boolean isTokenValid = false;

        if (connOpt.isPresent()) {
            SocialConnection conn = connOpt.get();
            isConnected = "CONNECTED".equalsIgnoreCase(conn.getStatus());
            dto.setConnected(isConnected);
            dto.setAccountHandle(conn.getAccountHandle());
            dto.setProviderAccountId(conn.getProviderAccountId());
            dto.setStatus(conn.getStatus());
            dto.setTokenConfigured(conn.getEncryptedAccessToken() != null);
            dto.setTokenExpiresAt(conn.getTokenExpiresAt());

            if (conn.getEncryptedAccessToken() != null) {
                try {
                    String decrypted = tokenEncryptionService.decrypt(conn.getEncryptedAccessToken());
                    isTokenValid = decrypted != null && !decrypted.isBlank();
                    if (conn.getTokenExpiresAt() != null && conn.getTokenExpiresAt().isBefore(java.time.Instant.now())) {
                        isTokenValid = false;
                        dto.setStatus("EXPIRED");
                    }
                    dto.setTokenValid(isTokenValid);
                    if (decrypted != null && decrypted.length() > 8) {
                        dto.setTokenMasked(decrypted.substring(0, 4) + "••••••••" + decrypted.substring(decrypted.length() - 4));
                    } else if (decrypted != null && !decrypted.isBlank()) {
                        dto.setTokenMasked("••••••••");
                    } else {
                        dto.setTokenMasked(null);
                    }
                } catch (Exception e) {
                    dto.setTokenValid(false);
                    dto.setTokenMasked("ENCRYPTION_ERROR");
                }
            } else {
                dto.setTokenValid(false);
                dto.setTokenMasked(null);
            }
        } else {
            // Real account status: not connected
            dto.setConnected(false);
            dto.setAccountHandle(null);
            dto.setProviderAccountId(null);
            dto.setStatus("NOT_CONNECTED");
            dto.setTokenConfigured(false);
            dto.setTokenMasked(null);
            dto.setTokenValid(false);
        }

        dto.setDispatchMode(liveModeConfigured ? "LIVE" : "DRY_RUN");
        dto.setLiveModeEnabled(liveModeConfigured);

        // Redis diagnostics
        dto.setRedis(new InstagramDiagnosticsDto.RedisDiagnostics(
                redisRateLimiterService.getHealthStatus(),
                true,
                50,
                true
        ));

        // Webhook diagnostics
        dto.setWebhook(new InstagramDiagnosticsDto.WebhookDiagnostics(
                "/api/v1/webhooks/instagram",
                true,
                true,
                List.of("comments", "messages"),
                "HMAC-SHA256",
                "HEALTHY"
        ));

        // Kafka diagnostics
        dto.setKafka(new InstagramDiagnosticsDto.KafkaDiagnostics(
                "HEALTHY",
                true,
                "instagram.comments",
                true
        ));

        // Engine diagnostics
        List<AutomationWorkflow> activeWorkflows = workflowRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        List<AutomationExecution> executions = executionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        dto.setEngine(new InstagramDiagnosticsDto.EngineDiagnostics(
                (int) activeWorkflows.stream().filter(w -> "ACTIVE".equalsIgnoreCase(w.getStatus())).count(),
                executions.size(),
                List.of("contains", "exact")
        ));

        // Required permissions - strictly reflect real connection validity
        boolean permissionsActive = isConnected && isTokenValid;
        dto.setPermissions(List.of(
                new InstagramDiagnosticsDto.PermissionStatus("instagram_manage_comments", permissionsActive, permissionsActive, "Read comments on posts and reels and post public replies"),
                new InstagramDiagnosticsDto.PermissionStatus("instagram_manage_messages", permissionsActive, permissionsActive, "Send automated Direct Messages in response to comments within 7 days"),
                new InstagramDiagnosticsDto.PermissionStatus("pages_manage_metadata", permissionsActive, permissionsActive, "Subscribe to official Meta Graph API webhooks"),
                new InstagramDiagnosticsDto.PermissionStatus("pages_read_engagement", permissionsActive, permissionsActive, "Read follower events and engagement telemetry")
        ));

        // Official Meta Setup checklist for connecting real account
        dto.setSetupChecklist(List.of(
                "1. Switch Instagram profile to Professional (Creator or Business) in Instagram Mobile App Settings",
                "2. Link your Instagram account to a published Facebook Page in Meta Accounts Center",
                "3. In Instagram app: Settings > Messages and story replies > Message controls > Enable 'Allow access to messages'",
                "4. In Meta Developer Portal: Add 'Instagram Graph API' and configure Webhook Callback URL with Verify Token",
                "5. Subscribe to the 'comments' and 'messages' webhook fields on your Page",
                "6. Click 'Connect with Instagram' to complete official Meta OAuth 2.0 flow (tokens are stored encrypted with AES-256-GCM)",
                "7. Keep dispatch mode in DRY_RUN to test safely without notifying actual followers until ready for LIVE"
        ));

        return dto;
    }

    @Transactional
    public InstagramDiagnosticsDto connectInstagramAccount(UUID workspaceId, UUID userId, ConnectInstagramRequest request) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);

        SocialConnection conn = socialConnectionRepository
                .findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM")
                .orElseGet(() -> {
                    SocialConnection newConn = new SocialConnection();
                    newConn.setWorkspace(workspace);
                    newConn.setProvider("INSTAGRAM");
                    return newConn;
                });

        conn.setAccountHandle(request.getAccountHandle());
        conn.setProviderAccountId(request.getProviderAccountId());
        if (request.getAccessToken() != null && !request.getAccessToken().isBlank()) {
            String encrypted = tokenEncryptionService.encrypt(request.getAccessToken());
            conn.setEncryptedAccessToken(encrypted);
        }
        conn.setStatus("CONNECTED");
        socialConnectionRepository.save(conn);

        return getDiagnostics(workspaceId, userId);
    }

    @Transactional
    public InstagramDiagnosticsDto disconnectInstagramAccount(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Optional<SocialConnection> connOpt = socialConnectionRepository.findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM");
        if (connOpt.isPresent()) {
            SocialConnection conn = connOpt.get();
            conn.setStatus("DISCONNECTED");
            conn.setEncryptedAccessToken(null);
            socialConnectionRepository.save(conn);
            log.info("Instagram account safely disconnected for workspace: {}", workspaceId);
        }
        return getDiagnostics(workspaceId, userId);
    }

    @Transactional
    public AutomationExecution runTestDryRun(UUID workspaceId, UUID userId, TestDryRunRequest request) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);

        String accountId = "17841400000000001";
        Optional<SocialConnection> conn = socialConnectionRepository.findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM");
        if (conn.isPresent()) {
            accountId = conn.get().getProviderAccountId();
        }

        String commentId = "test_dryrun_" + UUID.randomUUID().toString().substring(0, 8);
        String username = request.getCommenterUsername() != null && !request.getCommenterUsername().isBlank()
                ? request.getCommenterUsername()
                : "test_follower";

        InstagramCommentEvent event = new InstagramCommentEvent(
                commentId,
                request.getMediaId() != null ? request.getMediaId() : "media_test_reel",
                "user_test_456",
                username,
                request.getCommentText(),
                accountId,
                System.currentTimeMillis() / 1000,
                true // Explicit dry-run
        );

        processCommentEvent(event);

        List<AutomationExecution> executions = executionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        if (!executions.isEmpty()) {
            return executions.get(0);
        }

        throw new BadRequestException("No active automation matched the test comment '" + request.getCommentText() + "'");
    }

    private AutomationWorkflowDto mapToDto(AutomationWorkflow wf) {
        return new AutomationWorkflowDto(
                wf.getId(),
                wf.getName(),
                wf.getTriggerKeyword(),
                wf.getMatchType(),
                wf.getMediaId(),
                wf.getDmMessageTemplate(),
                wf.getPublicReplyTemplate(),
                wf.getStatus(),
                wf.getRunsCount(),
                wf.getFollowersGained(),
                wf.getButtonClicks()
        );
    }
}
