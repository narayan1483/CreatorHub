package com.creatorhub;

import com.creatorhub.dto.auth.AuthResponse;
import com.creatorhub.dto.auth.RegisterRequest;
import com.creatorhub.dto.autodm.CreateWorkflowRequest;
import com.creatorhub.dto.autodm.SimulateCommentRequest;
import com.creatorhub.dto.autodm.SimulationResultDto;
import com.creatorhub.service.AuthService;
import com.creatorhub.service.AutomationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AutomationServiceTest {

    @Autowired
    private AutomationService automationService;

    @Autowired
    private AuthService authService;

    @Test
    void testCommentSimulationMatchesTriggerKeyword() {
        // Register user and workspace
        AuthResponse auth = authService.register(new RegisterRequest("bot@example.com", "Password123!", "Bot Creator"));
        UUID workspaceId = auth.getDefaultWorkspace().getId();
        UUID userId = auth.getUser().getId();

        // Create workflow with keyword "STARTUP"
        CreateWorkflowRequest wfReq = new CreateWorkflowRequest();
        wfReq.setName("Startup Playbook AutoDM");
        wfReq.setTriggerKeyword("STARTUP");
        wfReq.setMatchType("contains");
        wfReq.setDmMessageTemplate("Hey {{first_name}}! Here is your download link: {{store_link}}");
        wfReq.setPublicReplyTemplate("Sent you a DM @{{first_name}}! 🚀");

        automationService.createWorkflow(workspaceId, userId, wfReq);

        // Simulate comment matching keyword
        SimulateCommentRequest simReq = new SimulateCommentRequest("Love this! Please send me the STARTUP guide", "tech_lead");
        SimulationResultDto result = automationService.simulateComment(workspaceId, simReq);

        assertTrue(result.isMatched());
        assertEquals("STARTUP", result.getTriggerKeyword());
        assertTrue(result.getDirectMessage().contains("tech_lead"));
        assertTrue(result.getPublicReply().contains("tech_lead"));

        // Simulate non-matching comment
        SimulateCommentRequest noMatchReq = new SimulateCommentRequest("Great video brother!", "fan_123");
        SimulationResultDto noMatchResult = automationService.simulateComment(workspaceId, noMatchReq);

        assertFalse(noMatchResult.isMatched());
    }
}
