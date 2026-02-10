package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saved_item")
public class SavedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID savedListId;

    @Column(nullable = false)
    private UUID furnitureId;

    @Column(nullable = false)
    private Instant createdAt;

    public SavedItem() {}

    public SavedItem(UUID savedListId, UUID furnitureId) {
        this.savedListId = savedListId;
        this.furnitureId = furnitureId;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getSavedListId() { return savedListId; }
    public UUID getFurnitureId() { return furnitureId; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(UUID id) { this.id = id; }
    public void setSavedListId(UUID savedListId) { this.savedListId = savedListId; }
    public void setFurnitureId(UUID furnitureId) { this.furnitureId = furnitureId; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}