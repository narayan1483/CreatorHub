package com.creatorhub.service;

import com.creatorhub.dto.auth.*;
import com.creatorhub.dto.workspace.WorkspaceDto;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.exception.UnauthorizedException;
import com.creatorhub.model.RefreshToken;
import com.creatorhub.model.User;
import com.creatorhub.model.Workspace;
import com.creatorhub.model.WorkspaceMembership;
import com.creatorhub.repository.RefreshTokenRepository;
import com.creatorhub.repository.UserRepository;
import com.creatorhub.repository.WorkspaceMembershipRepository;
import com.creatorhub.repository.WorkspaceRepository;
import com.creatorhub.security.JwtTokenProvider;
import com.creatorhub.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthService(
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMembershipRepository membershipRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // 1. Create User
        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName()
        );
        user = userRepository.save(user);

        // 2. Generate workspace slug
        String slug = request.getWorkspaceSlug();
        if (slug == null || slug.isBlank()) {
            slug = request.getFullName().toLowerCase().replaceAll("[^a-z0-9]", "");
            if (slug.isBlank()) slug = "creator" + user.getId().toString().substring(0, 6);
        }
        if (workspaceRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        // 3. Create Default Workspace
        Workspace workspace = new Workspace(slug, request.getFullName(), user);
        workspace = workspaceRepository.save(workspace);

        // 4. Create Workspace Membership (OWNER)
        WorkspaceMembership membership = new WorkspaceMembership(workspace, user, "OWNER");
        membershipRepository.save(membership);

        // 5. Generate Tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String rawRefreshToken = generateSecureTokenString();
        createRefreshTokenRecord(user, rawRefreshToken);

        UserSummaryDto userSummary = mapToUserSummary(user);
        WorkspaceDto workspaceDto = mapToWorkspaceDto(workspace, "OWNER");

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                userSummary,
                workspaceDto
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
        }

        // Fetch User's Workspaces
        List<WorkspaceMembership> memberships = membershipRepository.findByUserId(user.getId());
        WorkspaceDto defaultWorkspace = null;
        if (!memberships.isEmpty()) {
            Workspace ws = memberships.get(0).getWorkspace();
            defaultWorkspace = mapToWorkspaceDto(ws, memberships.get(0).getRole());
        }

        // Tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String rawRefreshToken = generateSecureTokenString();
        createRefreshTokenRecord(user, rawRefreshToken);

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                mapToUserSummary(user),
                defaultWorkspace
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.isRevoked() || token.isExpired()) {
            throw new UnauthorizedException("Refresh token has expired or was revoked. Please log in again.");
        }

        // Secure Token Rotation: Revoke old token
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);

        User user = token.getUser();
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Account suspended");
        }

        // Issue new pair
        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRawRefreshToken = generateSecureTokenString();
        createRefreshTokenRecord(user, newRawRefreshToken);

        List<WorkspaceMembership> memberships = membershipRepository.findByUserId(user.getId());
        WorkspaceDto defaultWorkspace = null;
        if (!memberships.isEmpty()) {
            Workspace ws = memberships.get(0).getWorkspace();
            defaultWorkspace = mapToWorkspaceDto(ws, memberships.get(0).getRole());
        }

        return new AuthResponse(
                newAccessToken,
                newRawRefreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                mapToUserSummary(user),
                defaultWorkspace
        );
    }

    @Transactional
    public void logout(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            refreshTokenRepository.deleteByUser(user);
        }
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return mapToUserSummary(user);
    }

    private void createRefreshTokenRecord(User user, String rawToken) {
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = Instant.now().plusMillis(refreshTokenExpirationMs);
        RefreshToken record = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(record);
    }

    private String generateSecureTokenString() {
        byte[] randomBytes = new byte[48];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private UserSummaryDto mapToUserSummary(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getStatus()
        );
    }

    private WorkspaceDto mapToWorkspaceDto(Workspace ws, String role) {
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
