package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class SessionToken {

    @Id
    @GeneratedValue
    private UUID id;

    private String token;

    private UUID userId;

    public UUID getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}