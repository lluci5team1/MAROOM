package com.maroom.maroom.dto;

import java.util.List;
import java.util.UUID;

public class PreferenceRequest {

    private UUID userId;
    private String homeType;
    private String roomSize;
    private List<String> styles;
    private List<String> colorPalette;
    private Integer minBudget;
    private Integer maxBudget;

    public PreferenceRequest() {}

    public UUID getUserId() {
        return userId;
    }

    public String getHomeType() {
        return homeType;
    }

    public String getRoomSize() {
        return roomSize;
    }

    public List<String> getStyles() {
        return styles;
    }

    public List<String> getColorPalette() {
        return colorPalette;
    }

    public Integer getMinBudget() {
        return minBudget;
    }

    public Integer getMaxBudget() {
        return maxBudget;
    }
}