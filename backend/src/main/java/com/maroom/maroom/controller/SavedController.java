package com.maroom.maroom.controller;

import com.maroom.maroom.domain.SavedItem;
import com.maroom.maroom.domain.SavedList;
import com.maroom.maroom.repository.SavedItemRepository;
import com.maroom.maroom.repository.SavedListRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/saved")
public class SavedController {

    private final SavedListRepository savedListRepository;
    private final SavedItemRepository savedItemRepository;

    public SavedController(SavedListRepository savedListRepository,
                           SavedItemRepository savedItemRepository) {
        this.savedListRepository = savedListRepository;
        this.savedItemRepository = savedItemRepository;
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
        return ResponseEntity.ok(savedItemRepository.findBySavedListId(listId));
    }
}
