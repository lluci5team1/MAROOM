package com.maroom.maroom.dto;

import java.util.UUID;

public class AuthResult {

    private String token;
    private UUID userId;
    private boolean hasCompletedOnboarding;
    private String email;
    private String displayName;

    public AuthResult(String token, UUID userId, boolean hasCompletedOnboarding, String email, String displayName) {
        this.token = token;
        this.userId = userId;
        this.hasCompletedOnboarding = hasCompletedOnboarding;
        this.email = email;
        this.displayName = displayName;
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

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }
}