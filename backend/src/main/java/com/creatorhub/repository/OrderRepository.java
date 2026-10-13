package com.creatorhub.repository;

import com.creatorhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);

    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o WHERE o.workspace.id = :workspaceId AND o.status = 'COMPLETED'")
    BigDecimal calculateGrossSales(@Param("workspaceId") UUID workspaceId);

    long countByWorkspaceIdAndStatus(UUID workspaceId, String status);
}
