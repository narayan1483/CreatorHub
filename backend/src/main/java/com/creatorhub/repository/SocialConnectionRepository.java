package com.creatorhub.repository;

import com.creatorhub.model.SocialConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocialConnectionRepository extends JpaRepository<SocialConnection, UUID> {
    List<SocialConnection> findByWorkspaceId(UUID workspaceId);
    Optional<SocialConnection> findByWorkspaceIdAndProvider(UUID workspaceId, String provider);
    Optional<SocialConnection> findByProviderAndProviderAccountId(String provider, String providerAccountId);
}
