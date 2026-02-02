package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "saved_lists")
public class SavedList {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;

    private String name;

    public SavedList() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
