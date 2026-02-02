package com.maroom.maroom.controller;

import com.maroom.maroom.domain.Preference;
import com.maroom.maroom.repository.PreferenceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/preferences")
public class PreferenceController {

    private final PreferenceRepository preferenceRepository;

    public PreferenceController(PreferenceRepository preferenceRepository) {
        this.preferenceRepository = preferenceRepository;
    }

    @PostMapping
    public ResponseEntity<Preference> savePreference(@RequestBody Preference preference) {
        return ResponseEntity.ok(preferenceRepository.save(preference));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Preference> getPreference(@PathVariable UUID userId) {
        return preferenceRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
