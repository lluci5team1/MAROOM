package com.maroom.maroom.controller;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/furniture-items")
public class FurnitureItemController {

    private final FurnitureItemRepository repo;

    public FurnitureItemController(FurnitureItemRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public FurnitureItem create(@RequestBody FurnitureItem item) {
        return repo.save(item);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FurnitureItem> getById(@PathVariable UUID id) {
        Optional<FurnitureItem> found = repo.findById(id);
        return found.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}