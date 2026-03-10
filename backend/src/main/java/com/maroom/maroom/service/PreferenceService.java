package com.maroom.maroom.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maroom.maroom.domain.Preference;
import com.maroom.maroom.dto.PreferenceRequest;
import com.maroom.maroom.repository.PreferenceRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;

@Service
public class PreferenceService {

    private static final Set<String> ALLOWED_HOME_TYPES = Set.of(
            "SINGLE_FAMILY_HOME",
            "1_BEDROOM",
            "2_BEDROOM",
            "DORM_STUDIO"
    );

    private static final Set<String> ALLOWED_ROOM_SIZES = Set.of(
            "SMALL",
            "MEDIUM",
            "LARGE"
    );

    private static final Set<String> ALLOWED_STYLES = Set.of(
            "MINIMALIST",
            "MODERN",
            "SCANDINAVIAN",
            "MID_CENTURY",
            "JAPANDI",
            "BOHO",
            "INDUSTRIAL"
    );

    private static final Set<String> ALLOWED_COLOR_PALETTES = Set.of(
            "WARM_NEUTRAL",
            "COOL_NEUTRAL",
            "EARTHY_TONES",
            "BLACK_WHITE",
            "VIBRANT",
            "PASTEL"
    );

    private final PreferenceRepository preferenceRepository;
    private final ObjectMapper objectMapper;

    public PreferenceService(PreferenceRepository preferenceRepository,
                             ObjectMapper objectMapper) {
        this.preferenceRepository = preferenceRepository;
        this.objectMapper = objectMapper;
    }

    public Preference savePreference(PreferenceRequest request) {
        validateRequest(request);

        Preference preference = preferenceRepository.findById(request.getUserId())
                .orElseGet(Preference::new);

        preference.setUserId(request.getUserId());
        preference.setHomeType(request.getHomeType());
        preference.setRoomSize(request.getRoomSize());
        preference.setStyles(toJson(request.getStyles()));
        preference.setColorPalette(toJson(request.getColorPalette()));
        preference.setMinBudget(request.getMinBudget());
        preference.setMaxBudget(request.getMaxBudget());

        return preferenceRepository.save(preference);
    }

    public Preference getPreference(UUID userId) {
        return preferenceRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Preference not found"));
    }

    private void validateRequest(PreferenceRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        if (request.getHomeType() == null || request.getHomeType().isBlank()) {
            throw new IllegalArgumentException("homeType is required");
        }

        if (!ALLOWED_HOME_TYPES.contains(request.getHomeType())) {
            throw new IllegalArgumentException("Invalid homeType");
        }

        if (request.getRoomSize() == null || request.getRoomSize().isBlank()) {
            throw new IllegalArgumentException("roomSize is required");
        }

        if (!ALLOWED_ROOM_SIZES.contains(request.getRoomSize())) {
            throw new IllegalArgumentException("Invalid roomSize");
        }

        if (request.getStyles() == null || request.getStyles().isEmpty()) {
            throw new IllegalArgumentException("At least one style is required");
        }

        if (request.getStyles().size() > 3) {
            throw new IllegalArgumentException("You can select up to 3 styles");
        }

        for (String style : request.getStyles()) {
            if (!ALLOWED_STYLES.contains(style)) {
                throw new IllegalArgumentException("Invalid style: " + style);
            }
        }

        if (request.getColorPalette() == null || request.getColorPalette().isEmpty()) {
            throw new IllegalArgumentException("At least one color palette is required");
        }

        if (request.getColorPalette().size() > 2) {
            throw new IllegalArgumentException("You can select up to 2 color palettes");
        }

        for (String color : request.getColorPalette()) {
            if (!ALLOWED_COLOR_PALETTES.contains(color)) {
                throw new IllegalArgumentException("Invalid colorPalette: " + color);
            }
        }

        if (request.getMinBudget() == null || request.getMaxBudget() == null) {
            throw new IllegalArgumentException("Budget range is required");
        }

        if (request.getMinBudget() < 0 || request.getMaxBudget() < 0) {
            throw new IllegalArgumentException("Budget cannot be negative");
        }

        if (request.getMinBudget() > request.getMaxBudget()) {
            throw new IllegalArgumentException("minBudget cannot be greater than maxBudget");
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(
                    value == null ? Collections.emptyList() : value
            );
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to serialize preference data");
        }
    }
}