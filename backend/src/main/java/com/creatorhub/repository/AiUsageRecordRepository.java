package com.creatorhub.repository;

import com.creatorhub.model.AiUsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiUsageRecordRepository extends JpaRepository<AiUsageRecord, UUID> {
    List<AiUsageRecord> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);

    @Query("SELECT COALESCE(SUM(r.totalTokens), 0) FROM AiUsageRecord r WHERE r.workspace.id = :workspaceId")
    long calculateTotalTokensConsumed(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT COALESCE(SUM(r.estimatedCostCents), 0) FROM AiUsageRecord r WHERE r.workspace.id = :workspaceId")
    long calculateTotalCostCents(@Param("workspaceId") UUID workspaceId);
}
