package com.maroom.maroom.controller;

import com.maroom.maroom.dto.PreferenceOptionsResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
public class PreferenceOptionsController {

    @GetMapping("/preferences/options")
    public PreferenceOptionsResponse getPreferenceOptions() {
        return new PreferenceOptionsResponse(
                List.of(
                        "SINGLE_FAMILY_HOME",
                        "1_BEDROOM",
                        "2_BEDROOM",
                        "DORM_STUDIO"
                ),
                List.of(
                        "SMALL",
                        "MEDIUM",
                        "LARGE"
                ),
                List.of(
                        "MINIMALIST",
                        "MODERN",
                        "SCANDINAVIAN",
                        "MID_CENTURY",
                        "JAPANDI",
                        "BOHO",
                        "INDUSTRIAL"
                ),
                List.of(
                        "WARM_NEUTRAL",
                        "COOL_NEUTRAL",
                        "EARTHY_TONES",
                        "BLACK_WHITE",
                        "VIBRANT",
                        "PASTEL"
                ),
                List.of(
                        "UNDER_100",
                        "100_300",
                        "300_500",
                        "500_PLUS"
                )
        );
    }
}