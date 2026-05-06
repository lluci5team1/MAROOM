package com.maroom.maroom.controller;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.service.FurnitureEmbeddingService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/furniture-items")
public class FurnitureItemController {

    private final FurnitureItemRepository repo;
    private final FurnitureEmbeddingService furnitureEmbeddingService;

    public FurnitureItemController(FurnitureItemRepository repo,
                                   FurnitureEmbeddingService furnitureEmbeddingService) {
        this.repo = repo;
        this.furnitureEmbeddingService = furnitureEmbeddingService;
    }

    @PostMapping
    public FurnitureItem create(@RequestBody FurnitureItem item) {
        FurnitureItem savedItem = repo.save(item);
        furnitureEmbeddingService.embedFurniture(savedItem);
        return savedItem;
    }

    @PostMapping("/embeddings/backfill")
    public ResponseEntity<FurnitureEmbeddingService.BackfillResult> backfillEmbeddings(
            @RequestParam(defaultValue = "25") int limit,
            @RequestParam(defaultValue = "25") int batchSize
    ) {
        return ResponseEntity.ok(furnitureEmbeddingService.backfillMissingEmbeddings(limit, batchSize));
    }


    @GetMapping
    public ResponseEntity<List<FurnitureItem>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FurnitureItem>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) List<String> roomType,
            @RequestParam(required = false) List<String> color,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String sortBy
    ) {
        Specification<FurnitureItem> spec = (root, query, cb) -> cb.conjunction();

        if (q != null && !q.isBlank()) {
            String pattern = "%" + q.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), pattern));
        }
        if (brand != null && !brand.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
        }
        if (category != null && !category.isEmpty()) {
            List<String> normalized = category.stream().map(String::toLowerCase).toList();
            spec = spec.and((root, query, cb) -> {
                Predicate p = cb.disjunction();
                for (String value : normalized) {
                    String pattern = "%" + value + "%";
                    p = cb.or(
                            p,
                            cb.like(cb.lower(root.get("category")), pattern),
                            cb.like(cb.lower(root.get("roomType")), pattern)
                    );
                }
                return p;
            });
        }
        if (roomType != null && !roomType.isEmpty()) {
            List<String> normalized = roomType.stream().map(String::toLowerCase).toList();
            spec = spec.and((root, query, cb) -> {
                Predicate p = cb.disjunction();
                for (String value : normalized) {
                    String pattern = "%" + value + "%";
                    p = cb.or(p, cb.like(cb.lower(root.get("roomType")), pattern));
                }
                return p;
            });
        }
        if (color != null && !color.isEmpty()) {
            List<String> normalized = color.stream().map(String::toLowerCase).toList();
            spec = spec.and((root, query, cb) -> {
                Predicate p = cb.disjunction();
                for (String value : normalized) {
                    String[] tokens = value.split("[^a-z0-9]+");
                    for (String token : tokens) {
                        if (token.length() >= 3) {
                            p = cb.or(p, cb.like(cb.lower(root.get("color")), "%" + token + "%"));
                        }
                    }
                }
                return p;
            });
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }

        Sort sort = Sort.unsorted();
        if ("price-high-to-low".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("price-low-to-high".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        }

        return ResponseEntity.ok(repo.findAll(spec, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FurnitureItem> getById(@PathVariable UUID id) {
        Optional<FurnitureItem> found = repo.findById(id);
        return found.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
