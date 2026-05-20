package com.maroom.maroom.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/preferences/options")
@CrossOrigin
public class PreferenceOptionsController {

    @GetMapping
    public Map<String, Object> getPreferenceOptions() {
        return Map.of(
                "homeTypes", List.of(
                        "SINGLE_FAMILY_HOME",
                        "1_BEDROOM",
                        "2_BEDROOM",
                        "DORM_STUDIO"
                ),
                "roomSizes", List.of(
                        "SMALL",
                        "MEDIUM",
                        "LARGE"
                ),
                "styles", List.of(
                        "MINIMALIST",
                        "MODERN",
                        "SCANDINAVIAN",
                        "MID_CENTURY",
                        "JAPANDI",
                        "BOHO",
                        "INDUSTRIAL"
                ),
                "colorPalettes", List.of(
                        "WARM_NEUTRAL",
                        "COOL_NEUTRAL",
                        "EARTHY_TONES",
                        "BLACK_WHITE",
                        "VIBRANT",
                        "PASTEL"
                ),
                "budgets", List.of(
                        "UNDER_100",
                        "100_300",
                        "300_500",
                        "500_PLUS"
                )
        );
    }
}