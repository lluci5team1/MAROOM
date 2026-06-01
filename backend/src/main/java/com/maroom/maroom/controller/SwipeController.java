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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    /**
     * Undo the most recent swipe a user made on a given furniture item.
     * Removes the SwipeEvent record so the user can swipe the item again,
     * and if the prior swipe was RIGHT, also removes the item from the
     * user's Liked list. Idempotent: returns ok=false with a message if
     * no prior swipe exists.
     */
    @DeleteMapping("/{userId}/{furnitureId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> undoSwipe(@PathVariable UUID userId,
                                                          @PathVariable UUID furnitureId) {
        Optional<SwipeEvent> existing =
                swipeEventRepository.findFirstByUserIdAndFurnitureIdOrderByCreatedAtDesc(userId, furnitureId);

        if (existing.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "ok", false,
                    "message", "No prior swipe to undo"
            ));
        }

        SwipeEvent event = existing.get();
        SwipeDirection previousDirection = event.getDirection();
        boolean removedFromLiked = false;

        if (previousDirection == SwipeDirection.RIGHT) {
            Optional<SavedList> likedList = savedListRepository.findFirstByUserIdAndName(userId, "Liked");
            if (likedList.isPresent()) {
                Optional<SavedItem> savedItem = savedItemRepository
                        .findFirstBySavedListIdAndFurnitureId(likedList.get().getId(), furnitureId);
                if (savedItem.isPresent()) {
                    savedItemRepository.delete(savedItem.get());
                    removedFromLiked = true;
                }
            }
        }

        swipeEventRepository.delete(event);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("undoneDirection", previousDirection);
        res.put("removedFromLiked", removedFromLiked);
        res.put("userEmbedding", userEmbeddingService.recomputeUserEmbedding(userId));
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
                                                       @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(recommendationService.getRandomFeedForUser(userId, size));
    }
}
