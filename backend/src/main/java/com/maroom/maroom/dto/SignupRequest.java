package com.maroom.maroom.dto;

public class SignupRequest {

    private String email;
    private String password;
    private String displayName;

    public SignupRequest() {}

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getDisplayName() {
        return displayName;
    }
}