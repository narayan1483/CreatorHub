package com.creatorhub;

import com.creatorhub.dto.meta.InstagramCommentEvent;
import com.creatorhub.model.AutomationExecution;
import com.creatorhub.model.AutomationWorkflow;
import com.creatorhub.model.User;
import com.creatorhub.model.Workspace;
import com.creatorhub.repository.AutomationExecutionRepository;
import com.creatorhub.repository.AutomationWorkflowRepository;
import com.creatorhub.repository.SocialConnectionRepository;
import com.creatorhub.repository.WebhookEventRepository;
import com.creatorhub.security.TokenEncryptionService;
import com.creatorhub.service.AutomationService;
import com.creatorhub.service.MetaGraphApiClient;
import com.creatorhub.service.WorkspaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InstagramAutoDmIntegrationTest {

    private AutomationService automationService;
    private AutomationWorkflowRepository workflowRepository;
    private AutomationExecutionRepository executionRepository;
    private WorkspaceService workspaceService;
    private SocialConnectionRepository socialConnectionRepository;
    private TokenEncryptionService tokenEncryptionService;
    private MetaGraphApiClient metaGraphApiClient;
    private WebhookEventRepository webhookEventRepository;

    private Workspace workspace;
    private AutomationWorkflow blueprintWorkflow;

    @BeforeEach
    void setUp() {
        workflowRepository = mock(AutomationWorkflowRepository.class);
        executionRepository = mock(AutomationExecutionRepository.class);
        workspaceService = mock(WorkspaceService.class);
        socialConnectionRepository = mock(SocialConnectionRepository.class);
        tokenEncryptionService = mock(TokenEncryptionService.class);
        metaGraphApiClient = mock(MetaGraphApiClient.class);
        webhookEventRepository = mock(WebhookEventRepository.class);

        automationService = new AutomationService(
                workflowRepository,
                executionRepository,
                workspaceService,
                socialConnectionRepository,
                tokenEncryptionService,
                metaGraphApiClient,
                webhookEventRepository
        );

        User owner = new User("Alex", "alex@creatorhub.to", "hash");
        workspace = new Workspace("alexrivera", "Alex Rivera", owner);

        when(workspaceService.getWorkspaceEntity(any())).thenReturn(workspace);

        blueprintWorkflow = new AutomationWorkflow(
                workspace,
                "Blueprint AutoDM",
                "BLUEPRINT",
                "Hey {{first_name}}, here is the link to the blueprint: {{store_link}}",
                "Sent you the blueprint in DM, @{{first_name}}! Check your inbox 🚀"
        );
        blueprintWorkflow.setMatchType("contains");

        when(workflowRepository.findByWorkspaceIdOrderByCreatedAtDesc(any()))
                .thenReturn(List.of(blueprintWorkflow));

        when(metaGraphApiClient.sendDirectMessage(any(), any(), any(), any(), anyBoolean()))
                .thenReturn(new MetaGraphApiClient.DeliveryResult(true, true, "mid_123", "Dry run"));
    }

    @Test
    void testCommentWithMatchingKeywordTriggersAutoDmAndLogsExecution() {
        InstagramCommentEvent event = new InstagramCommentEvent(
                "c_101",
                "media_202",
                "user_303",
                "rahul_dev",
                "Can you please send me the BLUEPRINT link?",
                "page_999",
                System.currentTimeMillis(),
                true
        );

        automationService.processCommentEvent(event);

        // Verify workflow runs incremented
        assertEquals(1, blueprintWorkflow.getRunsCount());
        assertEquals(1, blueprintWorkflow.getFollowersGained());
        verify(workflowRepository, times(1)).save(blueprintWorkflow);

        // Verify execution record captured
        ArgumentCaptor<AutomationExecution> captor = ArgumentCaptor.forClass(AutomationExecution.class);
        verify(executionRepository, times(1)).save(captor.capture());

        AutomationExecution saved = captor.getValue();
        assertEquals("@rahul_dev", saved.getRecipientHandle());
        assertTrue(saved.getSentDm().contains("https://creatorhub.to/@alexrivera"));
        assertTrue(saved.getSentDm().contains("rahul_dev"));
        assertEquals("DRY_RUN", saved.getStatus());
    }

    @Test
    void testCommentCaseInsensitiveKeywordMatching() {
        InstagramCommentEvent event = new InstagramCommentEvent(
                "c_102",
                "media_202",
                "user_304",
                "sneha_tech",
                "i want the blueprint now",
                "page_999",
                System.currentTimeMillis(),
                true
        );

        automationService.processCommentEvent(event);

        assertEquals(1, blueprintWorkflow.getRunsCount());
        verify(executionRepository, times(1)).save(any(AutomationExecution.class));
    }

    @Test
    void testCommentWithoutKeywordIsIgnoredSafely() {
        InstagramCommentEvent event = new InstagramCommentEvent(
                "c_103",
                "media_202",
                "user_305",
                "random_user",
                "Great reel, nice camera quality!",
                "page_999",
                System.currentTimeMillis(),
                true
        );

        automationService.processCommentEvent(event);

        assertEquals(0, blueprintWorkflow.getRunsCount());
        verify(executionRepository, never()).save(any());
        verify(metaGraphApiClient, never()).sendDirectMessage(any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void testExactKeywordMatchingEnforcesExactMatch() {
        blueprintWorkflow.setMatchType("exact");

        // Partial comment should NOT match exact trigger
        InstagramCommentEvent partialEvent = new InstagramCommentEvent(
                "c_104",
                "media_202",
                "user_306",
                "user1",
                "BLUEPRINT please",
                "page_999",
                System.currentTimeMillis(),
                true
        );
        automationService.processCommentEvent(partialEvent);
        assertEquals(0, blueprintWorkflow.getRunsCount());

        // Exact match should trigger
        InstagramCommentEvent exactEvent = new InstagramCommentEvent(
                "c_105",
                "media_202",
                "user_307",
                "user2",
                "BLUEPRINT",
                "page_999",
                System.currentTimeMillis(),
                true
        );
        automationService.processCommentEvent(exactEvent);
        assertEquals(1, blueprintWorkflow.getRunsCount());
    }
}
