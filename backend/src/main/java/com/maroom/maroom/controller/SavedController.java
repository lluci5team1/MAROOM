package com.maroom.maroom.controller;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.domain.SavedItem;
import com.maroom.maroom.domain.SavedList;
import com.maroom.maroom.dto.SavedFurnitureResponse;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.repository.SavedItemRepository;
import com.maroom.maroom.repository.SavedListRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/saved")
public class SavedController {

    private final SavedListRepository savedListRepository;
    private final SavedItemRepository savedItemRepository;
    private final FurnitureItemRepository furnitureItemRepository;

    public SavedController(SavedListRepository savedListRepository,
                           SavedItemRepository savedItemRepository,
                           FurnitureItemRepository furnitureItemRepository) {
        this.savedListRepository = savedListRepository;
        this.savedItemRepository = savedItemRepository;
        this.furnitureItemRepository = furnitureItemRepository;
    }

    @PostMapping("/lists")
    public ResponseEntity<SavedList> createList(@RequestBody SavedList list) {
        return ResponseEntity.ok(savedListRepository.save(list));
    }

    @GetMapping("/lists/{userId}")
    public ResponseEntity<List<SavedList>> getLists(@PathVariable UUID userId) {
        return ResponseEntity.ok(savedListRepository.findByUserId(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<SavedItem> addItem(@RequestBody SavedItem item) {
        return ResponseEntity.ok(savedItemRepository.save(item));
    }

    @GetMapping("/items/{listId}")
    public ResponseEntity<List<SavedItem>> getItems(@PathVariable UUID listId) {
        return ResponseEntity.ok(savedItemRepository.findBySavedListIdOrderByCreatedAtDesc(listId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<SavedFurnitureResponse>> getSavedForUser(@PathVariable UUID userId) {
        Optional<SavedList> likedListOptional = savedListRepository.findFirstByUserIdAndName(userId, "Liked");

        if (likedListOptional.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        SavedList likedList = likedListOptional.get();
        List<SavedItem> savedItems = savedItemRepository.findBySavedListIdOrderByCreatedAtDesc(likedList.getId());

        List<SavedFurnitureResponse> response = savedItems.stream()
                .map(savedItem -> furnitureItemRepository.findById(savedItem.getFurnitureId())
                        .map(furniture -> toResponse(savedItem, furniture))
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}/{furnitureId}")
    public ResponseEntity<Map<String, Object>> removeSavedItem(@PathVariable UUID userId, @PathVariable UUID furnitureId) {
        Optional<SavedList> likedListOptional = savedListRepository.findFirstByUserIdAndName(userId, "Liked");
        if (likedListOptional.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "ok", false,
                    "message", "Liked list not found"
            ));
        }

        SavedList likedList = likedListOptional.get();
        Optional<SavedItem> savedItemOptional =
                savedItemRepository.findFirstBySavedListIdAndFurnitureId(likedList.getId(), furnitureId);

        if (savedItemOptional.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "ok", false,
                    "message", "Saved item not found"
            ));
        }

        savedItemRepository.delete(savedItemOptional.get());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private SavedFurnitureResponse toResponse(SavedItem savedItem, FurnitureItem furniture) {
        return new SavedFurnitureResponse(
                savedItem.getId(),
                savedItem.getCreatedAt(),
                furniture.getId(),
                furniture.getTitle(),
                furniture.getCategory(),
                furniture.getBrand(),
                furniture.getStyle(),
                furniture.getColor(),
                furniture.getPrice(),
                furniture.getRoomType(),
                furniture.getProductUrl(),
                furniture.getImageUrl()
        );
    }
}