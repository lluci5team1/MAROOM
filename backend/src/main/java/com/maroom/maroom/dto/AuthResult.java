package com.maroom.maroom.dto;

import java.util.UUID;

public class AuthResult {

    private String token;
    private UUID userId;
    private boolean hasCompletedOnboarding;

    public AuthResult(String token, UUID userId, boolean hasCompletedOnboarding) {
        this.token = token;
        this.userId = userId;
        this.hasCompletedOnboarding = hasCompletedOnboarding;
    }

    public String getToken() {
        return token;
    }

    public UUID getUserId() {
        return userId;
    }

    public boolean isHasCompletedOnboarding() {
        return hasCompletedOnboarding;
    }
}