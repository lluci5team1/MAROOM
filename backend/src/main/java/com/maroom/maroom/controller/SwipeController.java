package com.maroom.maroom.controller;

import com.maroom.maroom.domain.SavedItem;
import com.maroom.maroom.domain.SavedList;
import com.maroom.maroom.domain.SwipeDirection;
import com.maroom.maroom.domain.SwipeEvent;
import com.maroom.maroom.repository.SavedItemRepository;
import com.maroom.maroom.repository.SavedListRepository;
import com.maroom.maroom.repository.SwipeEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/swipe")
public class SwipeController {

    private final SwipeEventRepository swipeEventRepository;
    private final SavedListRepository savedListRepository;
    private final SavedItemRepository savedItemRepository;

    public SwipeController(SwipeEventRepository swipeEventRepository,
                           SavedListRepository savedListRepository,
                           SavedItemRepository savedItemRepository) {
        this.swipeEventRepository = swipeEventRepository;
        this.savedListRepository = savedListRepository;
        this.savedItemRepository = savedItemRepository;
    }

    // 요청 바디용 (DTO 폴더 안 만들고 컨트롤러 내부에 둠)
    public static class SwipeRequest {
        public UUID userId;
        public UUID furnitureId;
        public SwipeDirection direction;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> swipe(@RequestBody SwipeRequest req) {
        if (req.userId == null || req.furnitureId == null || req.direction == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "message", "userId, furnitureId, direction are required"
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

        return ResponseEntity.ok(res);
    }

    @GetMapping("/events/{userId}")
    public ResponseEntity<List<SwipeEvent>> listUserSwipes(@PathVariable UUID userId) {
        return ResponseEntity.ok(swipeEventRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
