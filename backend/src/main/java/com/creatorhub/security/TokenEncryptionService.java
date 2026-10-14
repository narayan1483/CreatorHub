package com.creatorhub.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Enterprise Token Encryption Service using AES-256-GCM.
 * Protects Meta OAuth tokens and sensitive social credentials at rest.
 * Uses a unique 12-byte Nonce/IV per encryption with a 128-bit authentication tag.
 */
@Service
public class TokenEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM
    private static final int GCM_TAG_LENGTH_BITS = 128; // 128 bit authentication tag

    private final SecureRandom secureRandom = new SecureRandom();
    private final SecretKey masterSecretKey;

    @org.springframework.beans.factory.annotation.Autowired
    public TokenEncryptionService(@Value("${creatorhub.security.encryption-key:${JWT_SECRET:default_dev_encryption_secret_key_change_in_prod}}") String rawKey) {
        this.masterSecretKey = deriveKey(rawKey);
    }

    /**
     * For unit testing with custom keys
     */
    public TokenEncryptionService(String rawKey, boolean isDirect) {
        this.masterSecretKey = deriveKey(rawKey);
    }

    /**
     * Encrypts plaintext sensitive token using AES-256-GCM.
     * Output format: Base64( IV [12 bytes] || CiphertextWithAuthTag )
     *
     * @param plainText token to encrypt
     * @return Base64 encoded encrypted token
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isBlank()) {
            throw new IllegalArgumentException("Cannot encrypt null or empty string");
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, masterSecretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new SecurityException("Failed to securely encrypt token: " + e.getMessage(), e);
        }
    }

    /**
     * Decrypts AES-256-GCM ciphertext and validates authentication tag.
     *
     * @param encryptedBase64 Base64 string containing IV and Ciphertext
     * @return original plainText token
     */
    public String decrypt(String encryptedBase64) {
        if (encryptedBase64 == null || encryptedBase64.isBlank()) {
            throw new IllegalArgumentException("Cannot decrypt null or empty string");
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedBase64);
            if (decoded.length < GCM_IV_LENGTH_BYTES + (GCM_TAG_LENGTH_BITS / 8)) {
                throw new SecurityException("Invalid ciphertext length: missing IV or authentication tag");
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, masterSecretKey, parameterSpec);

            byte[] plainTextBytes = cipher.doFinal(cipherText);
            return new String(plainTextBytes, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new SecurityException("Invalid base64 payload for decryption", e);
        } catch (Exception e) {
            // Catches AEADBadTagException if ciphertext is modified or wrong key is used
            throw new SecurityException("Decryption failed: corrupted ciphertext or key mismatch", e);
        }
    }

    /**
     * Derives a 256-bit (32 byte) AES SecretKey using SHA-256.
     */
    private SecretKey deriveKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, ALGORITHM);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available for key derivation", e);
        }
    }
}
