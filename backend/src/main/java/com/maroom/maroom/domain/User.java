package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "app_user",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String authProvider;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(columnDefinition = "TEXT")
    private String profilePictureUrl;

    protected User() {}

    public User(String email, String displayName, String authProvider, String passwordHash) {
        this.email = email;
        this.displayName = displayName;
        this.authProvider = authProvider;
        this.passwordHash = passwordHash;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getAuthProvider() { return authProvider; }
    public String getPasswordHash() { return passwordHash; }
    public Instant getCreatedAt() { return createdAt; }
    public String getProfilePictureUrl() { return profilePictureUrl; }

    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}