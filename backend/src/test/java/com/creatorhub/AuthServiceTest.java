package com.creatorhub;

import com.creatorhub.dto.auth.AuthResponse;
import com.creatorhub.dto.auth.LoginRequest;
import com.creatorhub.dto.auth.RefreshTokenRequest;
import com.creatorhub.dto.auth.RegisterRequest;
import com.creatorhub.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void testRegisterUserAndGenerateTokens() {
        RegisterRequest req = new RegisterRequest(
                "sarah@example.com",
                "StrongP@ss123",
                "Sarah Connor"
        );
        req.setWorkspaceSlug("sarahconnor");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertNotNull(res.getAccessToken());
        assertNotNull(res.getRefreshToken());
        assertEquals("sarah@example.com", res.getUser().getEmail());
        assertNotNull(res.getDefaultWorkspace());
        assertEquals("sarahconnor", res.getDefaultWorkspace().getSlug());
    }

    @Test
    void testLoginAndTokenRotation() {
        // Register first
        RegisterRequest regReq = new RegisterRequest(
                "john@example.com",
                "Password123!",
                "John Doe"
        );
        authService.register(regReq);

        // Login
        LoginRequest loginReq = new LoginRequest("john@example.com", "Password123!");
        AuthResponse loginRes = authService.login(loginReq);

        assertNotNull(loginRes.getAccessToken());
        assertNotNull(loginRes.getRefreshToken());

        // Refresh token
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(loginRes.getRefreshToken());
        AuthResponse refreshRes = authService.refreshToken(refreshReq);

        assertNotNull(refreshRes.getAccessToken());
        assertNotNull(refreshRes.getRefreshToken());
        assertNotEquals(loginRes.getRefreshToken(), refreshRes.getRefreshToken(), "Refresh token should rotate");
    }
}
