package com.creatorhub.repository;

import com.creatorhub.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByWorkspaceIdOrderBySortOrderAsc(UUID workspaceId);
    List<Product> findByWorkspaceIdAndVisibleTrueOrderBySortOrderAsc(UUID workspaceId);
    Optional<Product> findByWorkspaceIdAndSlug(UUID workspaceId, String slug);
    boolean existsByWorkspaceIdAndSlug(UUID workspaceId, String slug);
}
