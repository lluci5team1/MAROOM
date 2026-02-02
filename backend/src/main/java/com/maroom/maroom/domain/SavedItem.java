package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "saved_items")
public class SavedItem {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID savedListId;
    private UUID furnitureId;

    public SavedItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSavedListId() { return savedListId; }
    public void setSavedListId(UUID savedListId) { this.savedListId = savedListId; }

    public UUID getFurnitureId() { return furnitureId; }
    public void setFurnitureId(UUID furnitureId) { this.furnitureId = furnitureId; }
}
