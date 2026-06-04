package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profile_pictures")
public class UserProfilePicture {

    @Id
    private UUID userId;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(nullable = false)
    private byte[] data;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Instant updatedAt;

    protected UserProfilePicture() {}

    public UserProfilePicture(UUID userId, byte[] data, String contentType) {
        this.userId = userId;
        this.data = data;
        this.contentType = contentType;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void touchUpdatedAt() {
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() { return userId; }
    public byte[] getData() { return data; }
    public String getContentType() { return contentType; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setData(byte[] data) { this.data = data; }
    public void setContentType(String contentType) { this.contentType = contentType; }
}
