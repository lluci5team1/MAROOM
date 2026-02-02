package com.maroom.maroom.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "preferences")
public class Preference {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private String homeType;
    private String roomSize;

    @Column(columnDefinition = "jsonb")
    private String styles;

    @Column(columnDefinition = "jsonb")
    private String colorPalette;

    private Integer minBudget;
    private Integer maxBudget;

    public Preference() {}

    // getters & setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getHomeType() { return homeType; }
    public void setHomeType(String homeType) { this.homeType = homeType; }

    public String getRoomSize() { return roomSize; }
    public void setRoomSize(String roomSize) { this.roomSize = roomSize; }

    public String getStyles() { return styles; }
    public void setStyles(String styles) { this.styles = styles; }

    public String getColorPalette() { return colorPalette; }
    public void setColorPalette(String colorPalette) { this.colorPalette = colorPalette; }

    public Integer getMinBudget() { return minBudget; }
    public void setMinBudget(Integer minBudget) { this.minBudget = minBudget; }

    public Integer getMaxBudget() { return maxBudget; }
    public void setMaxBudget(Integer maxBudget) { this.maxBudget = maxBudget; }
}
