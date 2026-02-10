package com.maroom.maroom.domain;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "swipe_event")
public class SwipeEvent {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID furnitureId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SwipeDirection direction;

    @Column(nullable = false)
    private Instant createdAt;

    public SwipeEvent() {}

    public SwipeEvent(UUID userId, UUID furnitureId, SwipeDirection direction) {
        this.userId = userId;
        this.furnitureId = furnitureId;
        this.direction = direction;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getFurnitureId() { return furnitureId; }
    public SwipeDirection getDirection() { return direction; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(UUID id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setFurnitureId(UUID furnitureId) { this.furnitureId = furnitureId; }
    public void setDirection(SwipeDirection direction) { this.direction = direction; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}