package com.creatorhub.service;

import com.creatorhub.dto.autodm.InstagramDiagnosticsDto;
import com.creatorhub.dto.oauth.MetaAuthorizeUrlResponse;
import com.creatorhub.dto.oauth.MetaOAuthCallbackRequest;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.model.SocialConnection;
import com.creatorhub.model.Workspace;
import com.creatorhub.repository.SocialConnectionRepository;
import com.creatorhub.security.TokenEncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Official Meta OAuth 2.0 & Instagram Professional Connection Service.
 * Implements Meta Graph API v19.0+ Authorization Code flow, HMAC state validation,
 * token exchange, long-lived token generation, and account discovery.
 */
@Service
public class InstagramOAuthService {

    private static final Logger log = LoggerFactory.getLogger(InstagramOAuthService.class);

    private static final String META_DIALOG_OAUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth";
    private static final String META_GRAPH_OAUTH_URL = "https://graph.facebook.com/v19.0/oauth/access_token";
    private static final String META_GRAPH_ACCOUNTS_URL = "https://graph.facebook.com/v19.0/me/accounts";
    private static final String OAUTH_SCOPES = "instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_manage_metadata,pages_read_engagement,pages_show_list";

    private final WorkspaceService workspaceService;
    private final SocialConnectionRepository socialConnectionRepository;
    private final TokenEncryptionService tokenEncryptionService;
    private final AutomationService automationService;
    private final RestTemplate restTemplate;

    @Value("${creatorhub.meta.app-id:}")
    private String appId;

    @Value("${creatorhub.meta.app-secret:}")
    private String appSecret;

    @Value("${creatorhub.meta.redirect-uri:http://localhost:5173/auth/meta/callback}")
    private String redirectUri;

    @org.springframework.beans.factory.annotation.Autowired
    public InstagramOAuthService(
            WorkspaceService workspaceService,
            SocialConnectionRepository socialConnectionRepository,
            TokenEncryptionService tokenEncryptionService,
            AutomationService automationService) {
        this(workspaceService, socialConnectionRepository, tokenEncryptionService, automationService, new RestTemplate());
    }

    public InstagramOAuthService(
            WorkspaceService workspaceService,
            SocialConnectionRepository socialConnectionRepository,
            TokenEncryptionService tokenEncryptionService,
            AutomationService automationService,
            RestTemplate restTemplate) {
        this.workspaceService = workspaceService;
        this.socialConnectionRepository = socialConnectionRepository;
        this.tokenEncryptionService = tokenEncryptionService;
        this.automationService = automationService;
        this.restTemplate = restTemplate;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    /**
     * Generates official Meta OAuth 2.0 authorization URL with cryptographically secure, signed state.
     */
    public MetaAuthorizeUrlResponse generateAuthorizationUrl(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);

        if (appId == null || appId.isBlank()) {
            throw new BadRequestException("Meta App ID is not configured on the backend. Please set the META_APP_ID environment variable with your Meta App ID from Meta Developer Portal.");
        }

        String state = generateState(workspaceId, userId);

        String authorizationUrl = UriComponentsBuilder.fromHttpUrl(META_DIALOG_OAUTH_URL)
                .queryParam("client_id", appId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("state", state)
                .queryParam("scope", OAUTH_SCOPES)
                .queryParam("response_type", "code")
                .toUriString();

        log.info("Generated Meta OAuth authorization URL for workspace: {} and user: {}", workspaceId, userId);
        return new MetaAuthorizeUrlResponse(authorizationUrl, state, appId, redirectUri);
    }

    /**
     * Validates cryptographic signature and expiration of OAuth state parameter.
     */
    public void validateState(String state, UUID workspaceId, UUID userId) {
        if (state == null || state.isBlank()) {
            throw new BadRequestException("OAuth state parameter is missing.");
        }
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(state);
            String decoded = new String(decodedBytes, StandardCharsets.UTF_8);
            String[] parts = decoded.split(":");
            if (parts.length != 5) {
                throw new BadRequestException("Malformed OAuth state parameter.");
            }
            String stateWsId = parts[0];
            String stateUserId = parts[1];
            long timestamp = Long.parseLong(parts[2]);
            String nonce = parts[3];
            String receivedSig = parts[4];

            if (!workspaceId.toString().equals(stateWsId) || !userId.toString().equals(stateUserId)) {
                throw new BadRequestException("OAuth state does not match the active workspace or creator session.");
            }

            long now = Instant.now().toEpochMilli();
            if (now - timestamp > 900_000L || timestamp > now + 60_000L) {
                throw new BadRequestException("OAuth state has expired (valid for 15 minutes). Please restart connection.");
            }

            String data = stateWsId + ":" + stateUserId + ":" + timestamp + ":" + nonce;
            String expectedSig = computeHmacSha256(data, getSigningSecret());

            if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), receivedSig.getBytes(StandardCharsets.UTF_8))) {
                throw new BadRequestException("OAuth state signature verification failed. Possible CSRF attack detected.");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse OAuth state: {}", e.getMessage());
            throw new BadRequestException("Invalid OAuth state: " + e.getMessage());
        }
    }

    /**
     * Handles the OAuth callback: exchanges authorization code for short-lived token,
     * exchanges for long-lived user token, discovers linked Facebook Page & Instagram account,
     * encrypts Page Access Token using AES-256-GCM, and persists into social_connections.
     */
    @Transactional
    public InstagramDiagnosticsDto handleOAuthCallback(UUID workspaceId, UUID userId, MetaOAuthCallbackRequest request) {
        workspaceService.assertUserAccess(workspaceId, userId);
        validateState(request.state(), workspaceId, userId);

        if (appId == null || appId.isBlank() || appSecret == null || appSecret.isBlank()) {
            throw new BadRequestException("Meta App credentials (META_APP_ID, META_APP_SECRET) are not configured on the backend.");
        }

        log.info("Starting Meta OAuth code exchange for workspace: {}", workspaceId);

        // Step 1: Exchange code for short-lived user access token
        String shortLivedToken;
        try {
            String tokenExchangeUrl = UriComponentsBuilder.fromHttpUrl(META_GRAPH_OAUTH_URL)
                    .queryParam("client_id", appId)
                    .queryParam("client_secret", appSecret)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("code", request.code())
                    .toUriString();

            ResponseEntity<Map> tokenResponse = restTemplate.getForEntity(tokenExchangeUrl, Map.class);
            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                throw new BadRequestException("Meta code exchange failed with HTTP " + tokenResponse.getStatusCode());
            }

            shortLivedToken = (String) tokenResponse.getBody().get("access_token");
            if (shortLivedToken == null || shortLivedToken.isBlank()) {
                throw new BadRequestException("No access_token returned by Meta token endpoint.");
            }
        } catch (Exception e) {
            log.error("Meta OAuth code exchange error: {}", e.getMessage());
            throw new BadRequestException("Failed to exchange Meta authorization code: " + e.getMessage());
        }

        // Step 2: Exchange for long-lived user access token (60-day)
        String longLivedToken = shortLivedToken;
        long expiresInSeconds = 5184000L; // 60 days default
        try {
            String longLivedUrl = UriComponentsBuilder.fromHttpUrl(META_GRAPH_OAUTH_URL)
                    .queryParam("grant_type", "fb_exchange_token")
                    .queryParam("client_id", appId)
                    .queryParam("client_secret", appSecret)
                    .queryParam("fb_exchange_token", shortLivedToken)
                    .toUriString();

            ResponseEntity<Map> longLivedResponse = restTemplate.getForEntity(longLivedUrl, Map.class);
            if (longLivedResponse.getStatusCode().is2xxSuccessful() && longLivedResponse.getBody() != null) {
                String exchanged = (String) longLivedResponse.getBody().get("access_token");
                if (exchanged != null && !exchanged.isBlank()) {
                    longLivedToken = exchanged;
                }
                Number exp = (Number) longLivedResponse.getBody().get("expires_in");
                if (exp != null) {
                    expiresInSeconds = exp.longValue();
                }
            }
        } catch (Exception e) {
            log.warn("Long-lived token exchange warning (falling back to short-lived token): {}", e.getMessage());
        }

        // Step 3: Discover Facebook Page and Instagram Business Account
        Map<String, Object> targetPage = null;
        Map<String, Object> targetIgAccount = null;
        try {
            String accountsUrl = UriComponentsBuilder.fromHttpUrl(META_GRAPH_ACCOUNTS_URL)
                    .queryParam("fields", "id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}")
                    .queryParam("access_token", longLivedToken)
                    .toUriString();

            ResponseEntity<Map> accountsResponse = restTemplate.getForEntity(accountsUrl, Map.class);
            if (!accountsResponse.getStatusCode().is2xxSuccessful() || accountsResponse.getBody() == null) {
                throw new BadRequestException("Failed to fetch user's Facebook Pages from Meta Graph API.");
            }

            List<Map<String, Object>> pages = (List<Map<String, Object>>) accountsResponse.getBody().get("data");
            if (pages != null) {
                for (Map<String, Object> page : pages) {
                    if (page.containsKey("instagram_business_account") && page.get("instagram_business_account") instanceof Map<?, ?> igMap) {
                        targetPage = page;
                        targetIgAccount = (Map<String, Object>) igMap;
                        break;
                    }
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to query Meta /me/accounts: {}", e.getMessage());
            throw new BadRequestException("Error discovering Instagram Business Account from Facebook Pages: " + e.getMessage());
        }

        if (targetPage == null || targetIgAccount == null) {
            throw new BadRequestException("No Instagram Professional account found linked to your Facebook Pages. " +
                    "Please verify that: 1) Your Instagram account is switched to Professional (Creator or Business) in mobile settings. " +
                    "2) It is linked to a published Facebook Page in Meta Accounts Center.");
        }

        String pageAccessToken = (String) targetPage.get("access_token");
        String igAccountId = String.valueOf(targetIgAccount.get("id"));
        String igUsername = (String) targetIgAccount.get("username");

        if (pageAccessToken == null || pageAccessToken.isBlank()) {
            // Fallback to user token if page-level token was not provided
            pageAccessToken = longLivedToken;
        }

        // Step 4: Encrypt access token using AES-256-GCM
        String encryptedToken = tokenEncryptionService.encrypt(pageAccessToken);

        // Step 5: Save or update SocialConnection entity
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);
        SocialConnection conn = socialConnectionRepository
                .findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM")
                .orElseGet(() -> {
                    SocialConnection newConn = new SocialConnection();
                    newConn.setWorkspace(workspace);
                    newConn.setProvider("INSTAGRAM");
                    return newConn;
                });

        conn.setAccountHandle(igUsername != null ? igUsername : "instagram_creator");
        conn.setProviderAccountId(igAccountId);
        conn.setEncryptedAccessToken(encryptedToken);
        conn.setTokenExpiresAt(Instant.now().plusSeconds(expiresInSeconds));
        conn.setStatus("CONNECTED");
        socialConnectionRepository.save(conn);

        log.info("Successfully connected Instagram Professional account @{} ({}) for workspace: {}",
                igUsername, igAccountId, workspaceId);

        return automationService.getDiagnostics(workspaceId, userId);
    }

    /**
     * Safely disconnects the Instagram account and purges the encrypted access token.
     */
    @Transactional
    public InstagramDiagnosticsDto disconnect(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Optional<SocialConnection> connOpt = socialConnectionRepository.findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM");
        if (connOpt.isPresent()) {
            SocialConnection conn = connOpt.get();
            conn.setStatus("DISCONNECTED");
            conn.setEncryptedAccessToken(null);
            socialConnectionRepository.save(conn);
            log.info("Instagram account safely disconnected for workspace: {}", workspaceId);
        }
        return automationService.getDiagnostics(workspaceId, userId);
    }

    public String generateState(UUID workspaceId, UUID userId) {
        long timestamp = Instant.now().toEpochMilli();
        String nonce = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String data = workspaceId + ":" + userId + ":" + timestamp + ":" + nonce;
        String signature = computeHmacSha256(data, getSigningSecret());
        String fullState = data + ":" + signature;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(fullState.getBytes(StandardCharsets.UTF_8));
    }

    private String computeHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256", e);
        }
    }

    private String getSigningSecret() {
        if (appSecret != null && !appSecret.isBlank()) {
            return appSecret;
        }
        return "creatorhub_default_oauth_hmac_signing_secret_2026";
    }
}
