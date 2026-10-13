package com.creatorhub.service;

import com.creatorhub.dto.workspace.WorkspaceDto;
import com.creatorhub.exception.ResourceNotFoundException;
import com.creatorhub.model.Workspace;
import com.creatorhub.model.WorkspaceMembership;
import com.creatorhub.repository.WorkspaceMembershipRepository;
import com.creatorhub.repository.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import com.creatorhub.dto.workspace.CreateWorkspaceRequest;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.model.User;
import com.creatorhub.repository.UserRepository;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMembershipRepository membershipRepository,
            UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspaceBySlug(String slug) {
        Workspace ws = workspaceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Creator workspace not found with handle: " + slug));
        return mapToDto(ws, "PUBLIC");
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspaceById(UUID workspaceId, UUID userId) {
        assertUserAccess(workspaceId, userId);
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
        WorkspaceMembership membership = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElse(null);
        String role = membership != null ? membership.getRole() : "VIEWER";
        return mapToDto(ws, role);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(UUID userId) {
        return membershipRepository.findByUserId(userId).stream()
                .map(m -> mapToDto(m.getWorkspace(), m.getRole()))
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceDto updateWorkspaceTheme(UUID workspaceId, UUID userId, String theme) {
        assertUserAccess(workspaceId, userId);
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
        ws.setTheme(theme);
        ws = workspaceRepository.save(ws);
        return mapToDto(ws, "OWNER");
    }

    @Transactional
    public WorkspaceDto createWorkspace(UUID userId, CreateWorkspaceRequest request) {
        if (workspaceRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Workspace handle already taken: " + request.getSlug());
        }
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace ws = new Workspace(request.getSlug(), request.getName(), owner);
        if (request.getTagline() != null) ws.setTagline(request.getTagline());
        if (request.getNiche() != null) ws.setNiche(request.getNiche());
        if (request.getTheme() != null) ws.setTheme(request.getTheme());
        ws = workspaceRepository.save(ws);

        WorkspaceMembership membership = new WorkspaceMembership(ws, owner, "OWNER");
        membershipRepository.save(membership);

        return mapToDto(ws, "OWNER");
    }

    public void assertUserAccess(UUID workspaceId, UUID userId) {
        boolean hasAccess = membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
        if (!hasAccess) {
            throw new AccessDeniedException("Access denied: You are not authorized to access this creator workspace");
        }
    }

    public Workspace getWorkspaceEntity(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));
    }

    private WorkspaceDto mapToDto(Workspace ws, String role) {
        return new WorkspaceDto(
                ws.getId(),
                ws.getSlug(),
                ws.getName(),
                ws.getTagline(),
                ws.getNiche(),
                ws.getTheme(),
                role
        );
    }
}
