package com.maroom.maroom.controller;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<FurnitureItem>> getRecommendations(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<FurnitureItem> recommendations =
                recommendationService.getRecommendationsForUser(userId, size);

        return ResponseEntity.ok(recommendations);
    }
}
