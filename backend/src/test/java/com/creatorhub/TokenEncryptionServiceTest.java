package com.creatorhub;

import com.creatorhub.security.TokenEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class TokenEncryptionServiceTest {

    private TokenEncryptionService encryptionService;
    private final String testKey = "master_secret_encryption_key_for_testing_123456789";

    @BeforeEach
    void setUp() {
        encryptionService = new TokenEncryptionService(testKey, true);
    }

    @Test
    void testEncryptAndDecryptSuccess() {
        String originalToken = "EAABwzLIX564BAO7ZCl4K...super_secret_meta_user_access_token";

        String encrypted = encryptionService.encrypt(originalToken);

        assertNotNull(encrypted);
        assertNotEquals(originalToken, encrypted);
        assertFalse(encrypted.contains("super_secret_meta_user_access_token"));

        String decrypted = encryptionService.decrypt(encrypted);
        assertEquals(originalToken, decrypted);
    }

    @Test
    void testUniqueNoncePerEncryption() {
        String token = "EAABwzLIX564BAO7ZCl4K...meta_access_token";

        String encrypted1 = encryptionService.encrypt(token);
        String encrypted2 = encryptionService.encrypt(token);

        // AES-GCM with fresh IV MUST produce distinct ciphertexts for identical plaintext
        assertNotEquals(encrypted1, encrypted2, "Each encryption must use a unique IV/nonce");

        assertEquals(token, encryptionService.decrypt(encrypted1));
        assertEquals(token, encryptionService.decrypt(encrypted2));
    }

    @Test
    void testDecryptWithIncorrectKeyFails() {
        String originalToken = "my_sensitive_meta_token";
        String encrypted = encryptionService.encrypt(originalToken);

        TokenEncryptionService wrongKeyService = new TokenEncryptionService("completely_wrong_key_99999999", true);

        SecurityException ex = assertThrows(SecurityException.class, () -> wrongKeyService.decrypt(encrypted));
        assertTrue(ex.getMessage().contains("Decryption failed"));
    }

    @Test
    void testDecryptWithCorruptedCiphertextFails() {
        String originalToken = "my_sensitive_meta_token";
        String encrypted = encryptionService.encrypt(originalToken);

        // Tamper with bytes
        byte[] decoded = Base64.getDecoder().decode(encrypted);
        decoded[decoded.length - 2] ^= 0x5A; // Flip bits in ciphertext / tag
        String tampered = Base64.getEncoder().encodeToString(decoded);

        SecurityException ex = assertThrows(SecurityException.class, () -> encryptionService.decrypt(tampered));
        assertTrue(ex.getMessage().contains("Decryption failed"));
    }

    @Test
    void testInvalidBase64OrEmptyPayload() {
        assertThrows(IllegalArgumentException.class, () -> encryptionService.encrypt(""));
        assertThrows(IllegalArgumentException.class, () -> encryptionService.encrypt(null));
        assertThrows(IllegalArgumentException.class, () -> encryptionService.decrypt(""));
        assertThrows(IllegalArgumentException.class, () -> encryptionService.decrypt(null));
        assertThrows(SecurityException.class, () -> encryptionService.decrypt("not-valid-base64-???"));
    }
}
