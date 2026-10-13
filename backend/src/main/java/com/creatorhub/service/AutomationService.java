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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AutomationService {

    private final AutomationWorkflowRepository workflowRepository;
    private final AutomationExecutionRepository executionRepository;
    private final WorkspaceService workspaceService;

    public AutomationService(
            AutomationWorkflowRepository workflowRepository,
            AutomationExecutionRepository executionRepository,
            WorkspaceService workspaceService) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
        this.workspaceService = workspaceService;
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
