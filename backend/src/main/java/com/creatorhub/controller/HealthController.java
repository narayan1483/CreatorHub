package com.creatorhub.controller;

import com.creatorhub.dto.common.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${spring.application.name:creatorhub-backend}")
    private String appName;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping
    public ApiResponse<Map<String, Object>> checkHealth() {
        Map<String, Object> status = Map.of(
                "status", "UP",
                "application", appName,
                "profile", activeProfile,
                "version", "1.0.0",
                "timestamp", Instant.now()
        );
        return ApiResponse.ok("CreatorHub Backend Service is operational", status);
    }
}
