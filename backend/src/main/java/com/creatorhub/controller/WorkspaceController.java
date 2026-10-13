package com.creatorhub.controller;

import com.creatorhub.dto.common.ApiResponse;
import com.creatorhub.dto.workspace.WorkspaceDto;
import com.creatorhub.security.UserPrincipal;
import com.creatorhub.service.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceDto>>> getUserWorkspaces(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WorkspaceDto> workspaces = workspaceService.getUserWorkspaces(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(workspaces));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceDto>> createWorkspace(
            @Valid @RequestBody com.creatorhub.dto.workspace.CreateWorkspaceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WorkspaceDto workspace = workspaceService.createWorkspace(userPrincipal.getId(), request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.created("Workspace created successfully", workspace));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceDto>> getWorkspaceById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WorkspaceDto workspace = workspaceService.getWorkspaceById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(workspace));
    }

    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<ApiResponse<WorkspaceDto>> getWorkspaceBySlug(@PathVariable String slug) {
        WorkspaceDto workspace = workspaceService.getWorkspaceBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(workspace));
    }

    @PatchMapping("/{id}/theme")
    public ResponseEntity<ApiResponse<WorkspaceDto>> updateTheme(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String theme = body.getOrDefault("theme", "indigo");
        WorkspaceDto updated = workspaceService.updateWorkspaceTheme(id, userPrincipal.getId(), theme);
        return ResponseEntity.ok(ApiResponse.ok("Theme updated successfully", updated));
    }
}
