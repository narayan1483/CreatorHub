package com.creatorhub.repository;

import com.creatorhub.model.AutomationWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AutomationWorkflowRepository extends JpaRepository<AutomationWorkflow, UUID> {
    List<AutomationWorkflow> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
    Optional<AutomationWorkflow> findByWorkspaceIdAndTriggerKeywordIgnoreCaseAndStatus(UUID workspaceId, String triggerKeyword, String status);
}
