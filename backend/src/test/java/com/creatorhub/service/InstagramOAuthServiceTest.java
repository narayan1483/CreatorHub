package com.creatorhub.service;

import com.creatorhub.dto.autodm.InstagramDiagnosticsDto;
import com.creatorhub.dto.oauth.MetaAuthorizeUrlResponse;
import com.creatorhub.dto.oauth.MetaOAuthCallbackRequest;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.model.SocialConnection;
import com.creatorhub.model.Workspace;
import com.creatorhub.repository.SocialConnectionRepository;
import com.creatorhub.security.TokenEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InstagramOAuthServiceTest {

    @Mock
    private WorkspaceService workspaceService;

    @Mock
    private SocialConnectionRepository socialConnectionRepository;

    @Mock
    private TokenEncryptionService tokenEncryptionService;

    @Mock
    private AutomationService automationService;

    @Mock
    private RestTemplate restTemplate;

    private InstagramOAuthService oAuthService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final String appId = "123456789012345";
    private final String appSecret = "test_meta_app_secret_987654321";
    private final String redirectUri = "http://localhost:5173/auth/meta/callback";

    @BeforeEach
    void setUp() {
        oAuthService = new InstagramOAuthService(
                workspaceService,
                socialConnectionRepository,
                tokenEncryptionService,
                automationService,
                restTemplate
        );
        oAuthService.setAppId(appId);
        oAuthService.setAppSecret(appSecret);
        oAuthService.setRedirectUri(redirectUri);
    }

    @Test
    @DisplayName("Should generate valid Meta OAuth dialog URL with signed state")
    void testGenerateAuthorizationUrl_Success() {
        doNothing().when(workspaceService).assertUserAccess(workspaceId, userId);

        MetaAuthorizeUrlResponse response = oAuthService.generateAuthorizationUrl(workspaceId, userId);

        assertNotNull(response);
        assertNotNull(response.authorizationUrl());
        assertNotNull(response.state());
        assertEquals(appId, response.appId());
        assertEquals(redirectUri, response.redirectUri());

        assertTrue(response.authorizationUrl().contains("client_id=" + appId));
        assertTrue(response.authorizationUrl().contains("instagram_manage_comments"));
        assertTrue(response.authorizationUrl().contains("instagram_manage_messages"));

        // Verify state is immediately valid
        assertDoesNotThrow(() -> oAuthService.validateState(response.state(), workspaceId, userId));
    }

    @Test
    @DisplayName("Should reject authorization URL generation if App ID is not configured")
    void testGenerateAuthorizationUrl_MissingAppId() {
        oAuthService.setAppId("");
        doNothing().when(workspaceService).assertUserAccess(workspaceId, userId);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                oAuthService.generateAuthorizationUrl(workspaceId, userId));

        assertTrue(ex.getMessage().contains("Meta App ID is not configured"));
    }

    @Test
    @DisplayName("Should reject state validation when workspaceId does not match")
    void testValidateState_WorkspaceMismatch() {
        String state = oAuthService.generateState(workspaceId, userId);
        UUID differentWorkspaceId = UUID.randomUUID();

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                oAuthService.validateState(state, differentWorkspaceId, userId));

        assertTrue(ex.getMessage().contains("does not match the active workspace"));
    }

    @Test
    @DisplayName("Should reject state validation when userId does not match")
    void testValidateState_UserMismatch() {
        String state = oAuthService.generateState(workspaceId, userId);
        UUID differentUserId = UUID.randomUUID();

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                oAuthService.validateState(state, workspaceId, differentUserId));

        assertTrue(ex.getMessage().contains("does not match the active workspace"));
    }

    @Test
    @DisplayName("Should reject state validation if tampered")
    void testValidateState_Tampered() {
        String validState = oAuthService.generateState(workspaceId, userId);
        byte[] decoded = Base64.getUrlDecoder().decode(validState);
        String decodedStr = new String(decoded, StandardCharsets.UTF_8);

        // Tamper with payload (e.g. change nonce)
        String[] parts = decodedStr.split(":");
        String tampered = parts[0] + ":" + parts[1] + ":" + parts[2] + ":tamperednonce:" + parts[4];
        String tamperedState = Base64.getUrlEncoder().withoutPadding().encodeToString(tampered.getBytes(StandardCharsets.UTF_8));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                oAuthService.validateState(tamperedState, workspaceId, userId));

        assertTrue(ex.getMessage().contains("signature verification failed") || ex.getMessage().contains("Invalid OAuth state"));
    }

    @Test
    @DisplayName("Should reject state validation if expired (>15 minutes)")
    void testValidateState_Expired() {
        long oldTimestamp = Instant.now().toEpochMilli() - (20 * 60 * 1000L); // 20 mins ago
        String nonce = "1234567890abcdef";
        String data = workspaceId + ":" + userId + ":" + oldTimestamp + ":" + nonce;

        // Generate manual HMAC
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmac) sb.append(String.format("%02x", b));
            String fullState = data + ":" + sb.toString();
            String expiredState = Base64.getUrlEncoder().withoutPadding().encodeToString(fullState.getBytes(StandardCharsets.UTF_8));

            BadRequestException ex = assertThrows(BadRequestException.class, () ->
                    oAuthService.validateState(expiredState, workspaceId, userId));

            assertTrue(ex.getMessage().contains("expired"));
        } catch (Exception e) {
            fail("Failed to setup expired test: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Should successfully exchange code, query accounts, encrypt token, and persist connection")
    void testHandleOAuthCallback_Success() {
        doNothing().when(workspaceService).assertUserAccess(workspaceId, userId);
        Workspace workspace = new Workspace();
        workspace.setId(workspaceId);
        when(workspaceService.getWorkspaceEntity(workspaceId)).thenReturn(workspace);

        String validState = oAuthService.generateState(workspaceId, userId);
        MetaOAuthCallbackRequest request = new MetaOAuthCallbackRequest("valid_auth_code_123", validState);

        // Mock Step 1: short-lived token exchange
        Map<String, Object> tokenBody = Map.of("access_token", "EAAB_short_lived_token", "token_type", "bearer");
        when(restTemplate.getForEntity(contains("/oauth/access_token?client_id="), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(tokenBody));

        // Mock Step 2: long-lived token exchange
        Map<String, Object> longLivedBody = Map.of("access_token", "EAAB_long_lived_token", "expires_in", 5184000L);
        when(restTemplate.getForEntity(contains("grant_type=fb_exchange_token"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(longLivedBody));

        // Mock Step 3: me/accounts query
        Map<String, Object> pageMap = new HashMap<>();
        pageMap.put("id", "page_1001");
        pageMap.put("name", "Creator Hub FB Page");
        pageMap.put("access_token", "EAAB_page_access_token_official");
        pageMap.put("instagram_business_account", Map.of(
                "id", "17841455555555555",
                "username", "real_creator_pro"
        ));

        Map<String, Object> accountsBody = Map.of("data", List.of(pageMap));
        when(restTemplate.getForEntity(contains("/me/accounts?fields="), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(accountsBody));

        when(tokenEncryptionService.encrypt("EAAB_page_access_token_official"))
                .thenReturn("enc_v1:iv123:ciphertext789:tag456");

        when(socialConnectionRepository.findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM"))
                .thenReturn(Optional.empty());

        InstagramDiagnosticsDto expectedDto = new InstagramDiagnosticsDto();
        expectedDto.setConnected(true);
        expectedDto.setAccountHandle("real_creator_pro");
        when(automationService.getDiagnostics(workspaceId, userId)).thenReturn(expectedDto);

        InstagramDiagnosticsDto result = oAuthService.handleOAuthCallback(workspaceId, userId, request);

        assertNotNull(result);
        assertTrue(result.isConnected());
        assertEquals("real_creator_pro", result.getAccountHandle());

        // Verify encrypted token was persisted in repository
        verify(socialConnectionRepository, times(1)).save(argThat(conn ->
                "INSTAGRAM".equals(conn.getProvider()) &&
                "real_creator_pro".equals(conn.getAccountHandle()) &&
                "17841455555555555".equals(conn.getProviderAccountId()) &&
                "enc_v1:iv123:ciphertext789:tag456".equals(conn.getEncryptedAccessToken()) &&
                "CONNECTED".equals(conn.getStatus())
        ));
    }

    @Test
    @DisplayName("Should fail with informative message if user has no Instagram Professional account linked to Facebook Page")
    void testHandleOAuthCallback_NoInstagramAccountLinked() {
        doNothing().when(workspaceService).assertUserAccess(workspaceId, userId);

        String validState = oAuthService.generateState(workspaceId, userId);
        MetaOAuthCallbackRequest request = new MetaOAuthCallbackRequest("valid_auth_code_123", validState);

        Map<String, Object> tokenBody = Map.of("access_token", "EAAB_short_lived_token");
        when(restTemplate.getForEntity(contains("/oauth/access_token?client_id="), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(tokenBody));

        Map<String, Object> longLivedBody = Map.of("access_token", "EAAB_long_lived_token", "expires_in", 5184000L);
        when(restTemplate.getForEntity(contains("grant_type=fb_exchange_token"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(longLivedBody));

        // Return page without instagram_business_account
        Map<String, Object> pageWithoutIg = Map.of("id", "page_1001", "name", "Regular FB Page");
        Map<String, Object> accountsBody = Map.of("data", List.of(pageWithoutIg));
        when(restTemplate.getForEntity(contains("/me/accounts?fields="), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(accountsBody));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                oAuthService.handleOAuthCallback(workspaceId, userId, request));

        assertTrue(ex.getMessage().contains("No Instagram Professional account found linked"));
    }

    @Test
    @DisplayName("Should safely disconnect account and set status to DISCONNECTED")
    void testDisconnect_Success() {
        doNothing().when(workspaceService).assertUserAccess(workspaceId, userId);

        SocialConnection conn = new SocialConnection();
        conn.setProvider("INSTAGRAM");
        conn.setStatus("CONNECTED");
        conn.setEncryptedAccessToken("enc_old_token");

        when(socialConnectionRepository.findByWorkspaceIdAndProvider(workspaceId, "INSTAGRAM"))
                .thenReturn(Optional.of(conn));

        InstagramDiagnosticsDto disconnectedDto = new InstagramDiagnosticsDto();
        disconnectedDto.setConnected(false);
        disconnectedDto.setStatus("DISCONNECTED");
        when(automationService.getDiagnostics(workspaceId, userId)).thenReturn(disconnectedDto);

        InstagramDiagnosticsDto result = oAuthService.disconnect(workspaceId, userId);

        assertNotNull(result);
        assertFalse(result.isConnected());
        assertEquals("DISCONNECTED", result.getStatus());

        verify(socialConnectionRepository, times(1)).save(argThat(c ->
                "DISCONNECTED".equals(c.getStatus()) && c.getEncryptedAccessToken() == null
        ));
    }
}
