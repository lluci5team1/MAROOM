package com.maroom.maroom.controller;

import com.maroom.maroom.domain.Preference;
import com.maroom.maroom.dto.PreferenceRequest;
import com.maroom.maroom.service.PreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/preferences")
@CrossOrigin
public class PreferenceController {

    private final PreferenceService preferenceService;

    public PreferenceController(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @PostMapping
    public ResponseEntity<?> savePreference(@RequestBody PreferenceRequest request) {
        try {
            Preference saved = preferenceService.savePreference(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getPreference(@PathVariable UUID userId) {
        try {
            Preference preference = preferenceService.getPreference(userId);
            return ResponseEntity.ok(preference);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}