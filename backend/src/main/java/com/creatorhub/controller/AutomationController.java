package com.creatorhub.controller;

import com.creatorhub.dto.autodm.AutomationWorkflowDto;
import com.creatorhub.dto.autodm.CreateWorkflowRequest;
import com.creatorhub.dto.autodm.SimulateCommentRequest;
import com.creatorhub.dto.autodm.SimulationResultDto;
import com.creatorhub.dto.common.ApiResponse;
import com.creatorhub.security.UserPrincipal;
import com.creatorhub.service.AutomationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/automations")
public class AutomationController {

    private final AutomationService automationService;

    public AutomationController(AutomationService automationService) {
        this.automationService = automationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AutomationWorkflowDto>>> getWorkflows(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AutomationWorkflowDto> workflows = automationService.getWorkflows(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(workflows));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AutomationWorkflowDto>> createWorkflow(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateWorkflowRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AutomationWorkflowDto created = automationService.createWorkflow(workspaceId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Automation workflow created successfully", created));
    }

    @PatchMapping("/{workflowId}/toggle")
    public ResponseEntity<ApiResponse<AutomationWorkflowDto>> toggleWorkflow(
            @PathVariable UUID workspaceId,
            @PathVariable UUID workflowId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AutomationWorkflowDto updated = automationService.toggleStatus(workspaceId, userPrincipal.getId(), workflowId);
        return ResponseEntity.ok(ApiResponse.ok("Workflow status toggled", updated));
    }

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<SimulationResultDto>> simulateComment(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody SimulateCommentRequest request) {
        SimulationResultDto result = automationService.simulateComment(workspaceId, request);
        return ResponseEntity.ok(ApiResponse.ok("Comment simulation executed", result));
    }

    @GetMapping("/executions")
    public ResponseEntity<ApiResponse<List<com.creatorhub.model.AutomationExecution>>> getExecutions(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<com.creatorhub.model.AutomationExecution> executions = automationService.getExecutions(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(executions));
    }

    @GetMapping("/diagnostics")
    public ResponseEntity<ApiResponse<com.creatorhub.dto.autodm.InstagramDiagnosticsDto>> getDiagnostics(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        com.creatorhub.dto.autodm.InstagramDiagnosticsDto diagnostics = automationService.getDiagnostics(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Instagram diagnostics fetched successfully", diagnostics));
    }

    @PostMapping("/connect")
    public ResponseEntity<ApiResponse<com.creatorhub.dto.autodm.InstagramDiagnosticsDto>> connectAccount(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody com.creatorhub.dto.autodm.ConnectInstagramRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        com.creatorhub.dto.autodm.InstagramDiagnosticsDto updated = automationService.connectInstagramAccount(workspaceId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Instagram account connection updated successfully", updated));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<com.creatorhub.dto.autodm.InstagramDiagnosticsDto>> disconnectAccount(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        com.creatorhub.dto.autodm.InstagramDiagnosticsDto updated = automationService.disconnectInstagramAccount(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Instagram account disconnected successfully", updated));
    }

    @PostMapping("/diagnostics/test-dry-run")
    public ResponseEntity<ApiResponse<com.creatorhub.model.AutomationExecution>> testDryRun(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody com.creatorhub.dto.autodm.TestDryRunRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        com.creatorhub.model.AutomationExecution execution = automationService.runTestDryRun(workspaceId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Dry-run comment test executed successfully", execution));
    }
}
