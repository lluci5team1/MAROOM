package com.maroom.maroom.controller;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.domain.SavedItem;
import com.maroom.maroom.domain.SavedList;
import com.maroom.maroom.domain.SwipeDirection;
import com.maroom.maroom.domain.SwipeEvent;
import com.maroom.maroom.repository.SavedItemRepository;
import com.maroom.maroom.repository.SavedListRepository;
import com.maroom.maroom.repository.SwipeEventRepository;
import com.maroom.maroom.service.RecommendationService;
import com.maroom.maroom.service.UserEmbeddingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/swipe")
public class SwipeController {

    private final SwipeEventRepository swipeEventRepository;
    private final SavedListRepository savedListRepository;
    private final SavedItemRepository savedItemRepository;
    private final RecommendationService recommendationService;
    private final UserEmbeddingService userEmbeddingService;

    public SwipeController(SwipeEventRepository swipeEventRepository,
                           SavedListRepository savedListRepository,
                           SavedItemRepository savedItemRepository,
                           RecommendationService recommendationService,
                           UserEmbeddingService userEmbeddingService) {
        this.swipeEventRepository = swipeEventRepository;
        this.savedListRepository = savedListRepository;
        this.savedItemRepository = savedItemRepository;
        this.recommendationService = recommendationService;
        this.userEmbeddingService = userEmbeddingService;
    }

    public static class SwipeRequest {
        public UUID userId;
        public UUID furnitureId;
        public SwipeDirection direction;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> swipe(@RequestBody SwipeRequest req) {
        if (req == null || req.userId == null || req.furnitureId == null || req.direction == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "message", "userId, furnitureId, direction are required"
            ));
        }

        if (swipeEventRepository.existsByUserIdAndFurnitureId(req.userId, req.furnitureId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "ok", false,
                    "message", "This furniture was already swiped by this user"
            ));
        }

        SwipeEvent event = new SwipeEvent(req.userId, req.furnitureId, req.direction);
        SwipeEvent savedEvent = swipeEventRepository.save(event);

        boolean savedToLiked = false;

        if (req.direction == SwipeDirection.RIGHT) {
            SavedList likedList = savedListRepository
                    .findFirstByUserIdAndName(req.userId, "Liked")
                    .orElseGet(() -> {
                        SavedList newList = new SavedList();
                        newList.setUserId(req.userId);
                        newList.setName("Liked");
                        return savedListRepository.save(newList);
                    });

            boolean exists = savedItemRepository.existsBySavedListIdAndFurnitureId(likedList.getId(), req.furnitureId);
            if (!exists) {
                SavedItem item = new SavedItem();
                item.setSavedListId(likedList.getId());
                item.setFurnitureId(req.furnitureId);
                savedItemRepository.save(item);
                savedToLiked = true;
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("swipeEventId", savedEvent.getId());
        res.put("savedToLiked", savedToLiked);
        res.put("userEmbedding", userEmbeddingService.recomputeUserEmbedding(req.userId));

        return ResponseEntity.ok(res);
    }

    @PostMapping("/user-embedding/{userId}/recompute")
    public ResponseEntity<UserEmbeddingService.RecomputeResult> recomputeUserEmbedding(@PathVariable UUID userId) {
        return ResponseEntity.ok(userEmbeddingService.recomputeUserEmbedding(userId));
    }

    @GetMapping("/events/{userId}")
    public ResponseEntity<List<SwipeEvent>> listUserSwipes(@PathVariable UUID userId) {
        return ResponseEntity.ok(swipeEventRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/feed/{userId}")
    public ResponseEntity<List<FurnitureItem>> getFeed(@PathVariable UUID userId,
                                                       @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(recommendationService.getFeedForUser(userId, size));
    }
}
