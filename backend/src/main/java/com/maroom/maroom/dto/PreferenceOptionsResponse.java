package com.maroom.maroom.dto;

import java.util.List;

public class PreferenceOptionsResponse {

    private final List<String> homeTypes;
    private final List<String> roomSizes;
    private final List<String> styles;
    private final List<String> colorPalettes;
    private final List<String> budgetTiers;

    public PreferenceOptionsResponse(List<String> homeTypes,
                                     List<String> roomSizes,
                                     List<String> styles,
                                     List<String> colorPalettes,
                                     List<String> budgetTiers) {
        this.homeTypes = homeTypes;
        this.roomSizes = roomSizes;
        this.styles = styles;
        this.colorPalettes = colorPalettes;
        this.budgetTiers = budgetTiers;
    }

    public List<String> getHomeTypes() {
        return homeTypes;
    }

    public List<String> getRoomSizes() {
        return roomSizes;
    }

    public List<String> getStyles() {
        return styles;
    }

    public List<String> getColorPalettes() {
        return colorPalettes;
    }

    public List<String> getBudgetTiers() {
        return budgetTiers;
    }
}