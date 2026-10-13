package com.creatorhub.repository;

import com.creatorhub.model.AutomationExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AutomationExecutionRepository extends JpaRepository<AutomationExecution, UUID> {
    List<AutomationExecution> findByWorkflowIdOrderByCreatedAtDesc(UUID workflowId);
    List<AutomationExecution> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
}
