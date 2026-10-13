package com.creatorhub.repository;

import com.creatorhub.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findByWorkspaceIdOrderByLastActiveAtDesc(UUID workspaceId);
    Optional<Customer> findByWorkspaceIdAndEmail(UUID workspaceId, String email);
    long countByWorkspaceId(UUID workspaceId);
}
