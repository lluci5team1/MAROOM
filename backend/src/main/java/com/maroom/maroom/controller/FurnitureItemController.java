package com.maroom.maroom.controller;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.domain.Preference;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.repository.PreferenceRepository;
import com.maroom.maroom.service.FurnitureEmbeddingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/furniture-items")
@CrossOrigin
public class FurnitureItemController {

    private final FurnitureItemRepository repo;
    private final PreferenceRepository preferenceRepository;
    private final FurnitureEmbeddingService furnitureEmbeddingService;

    public FurnitureItemController(
            FurnitureItemRepository repo,
            FurnitureEmbeddingService furnitureEmbeddingService,
            PreferenceRepository preferenceRepository
    ) {
        this.repo = repo;
        this.furnitureEmbeddingService = furnitureEmbeddingService;
        this.preferenceRepository = preferenceRepository;
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
            @RequestParam(defaultValue = "25") int batchSize,
            @RequestParam(required = false) Integer offset
    ) {
        if (offset != null) {
            return ResponseEntity.ok(
                    furnitureEmbeddingService.backfillMissingEmbeddingsWindow(limit, batchSize, offset)
            );
        }

        return ResponseEntity.ok(
                furnitureEmbeddingService.backfillMissingEmbeddings(limit, batchSize)
        );
    }

    @GetMapping
    public ResponseEntity<List<FurnitureItem>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/explore/{userId}")
    public ResponseEntity<List<FurnitureItem>> explore(
            @PathVariable UUID userId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) List<String> roomType,
            @RequestParam(required = false) List<String> style,
            @RequestParam(required = false) List<String> color,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String sortBy
    ) {
        Optional<Preference> preferenceOptional = preferenceRepository.findById(userId);

        List<String> onboardingStyles = List.of();
        List<String> onboardingColors = List.of();
        Integer onboardingMinBudget = null;
        Integer onboardingMaxBudget = null;

        if (preferenceOptional.isPresent()) {
            Preference preference = preferenceOptional.get();
            onboardingStyles = parseJsonList(preference.getStyles());
            onboardingColors = parseJsonList(preference.getColorPalette());
            onboardingMinBudget = preference.getMinBudget();
            onboardingMaxBudget = preference.getMaxBudget();
        }

        Integer effectiveMinPrice = minPrice != null ? minPrice : onboardingMinBudget;
        Integer effectiveMaxPrice = maxPrice != null ? maxPrice : onboardingMaxBudget;

        List<String> effectiveOnboardingStyles = onboardingStyles;
        List<String> effectiveOnboardingColors = onboardingColors;

        List<ScoredFurnitureItem> scoredItems = repo.findAll().stream()
                .map(item -> new ScoredFurnitureItem(
                        item,
                        calculateExploreScore(
                                item,
                                q,
                                brand,
                                category,
                                roomType,
                                style,
                                color,
                                effectiveMinPrice,
                                effectiveMaxPrice,
                                effectiveOnboardingStyles,
                                effectiveOnboardingColors
                        )
                ))
                .filter(scored -> scored.score() > 0 || noFiltersApplied(
                        q,
                        brand,
                        category,
                        roomType,
                        style,
                        color,
                        effectiveMinPrice,
                        effectiveMaxPrice
                ))
                .collect(Collectors.toList());

        sortScoredItems(scoredItems, sortBy);

        return ResponseEntity.ok(
                scoredItems.stream()
                        .map(ScoredFurnitureItem::item)
                        .toList()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<FurnitureItem>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) List<String> roomType,
            @RequestParam(required = false) List<String> style,
            @RequestParam(required = false) List<String> color,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "60") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        List<ScoredFurnitureItem> scoredItems = repo.findAll().stream()
                .map(item -> new ScoredFurnitureItem(
                        item,
                        calculateSearchScore(
                                item,
                                q,
                                brand,
                                category,
                                roomType,
                                style,
                                color,
                                minPrice,
                                maxPrice
                        )
                ))
                .filter(scored -> scored.score() > 0 || noFiltersApplied(
                        q, brand, category, roomType, style, color, minPrice, maxPrice
                ))
                .collect(Collectors.toList());

        sortScoredItems(scoredItems, sortBy);

        return ResponseEntity.ok(
                scoredItems.stream()
                        .skip(offset)
                        .limit(limit)
                        .map(ScoredFurnitureItem::item)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FurnitureItem> getById(@PathVariable UUID id) {
        Optional<FurnitureItem> found = repo.findById(id);

        return found.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private int calculateExploreScore(
            FurnitureItem item,
            String q,
            String brand,
            List<String> categories,
            List<String> roomTypes,
            List<String> styles,
            List<String> colors,
            Integer minPrice,
            Integer maxPrice,
            List<String> onboardingStyles,
            List<String> onboardingColors
    ) {
        int score = calculateSearchScore(
                item,
                q,
                brand,
                categories,
                roomTypes,
                styles,
                colors,
                minPrice,
                maxPrice
        );

        for (String onboardingStyle : onboardingStyles) {
            String normalizedStyle = normalize(onboardingStyle);

            if (contains(item.getStyle(), normalizedStyle)) {
                score += 8;
            } else if (isRelatedStyle(item.getStyle(), normalizedStyle)) {
                score += 4;
            }
        }

        for (String onboardingColor : onboardingColors) {
            String normalizedColor = normalize(onboardingColor);

            if (contains(item.getColor(), normalizedColor)) {
                score += 5;
            } else if (isRelatedColor(item.getColor(), normalizedColor)) {
                score += 3;
            }
        }

        return score;
    }

    private int calculateSearchScore(
            FurnitureItem item,
            String q,
            String brand,
            List<String> categories,
            List<String> roomTypes,
            List<String> styles,
            List<String> colors,
            Integer minPrice,
            Integer maxPrice
    ) {
        int score = 0;

        if (q != null && !q.isBlank()) {
            String query = normalize(q);

            if (contains(item.getTitle(), query)) score += 10;
            if (contains(item.getCategory(), query)) score += 5;
            if (contains(item.getStyle(), query)) score += 5;
            if (contains(item.getColor(), query)) score += 3;
            if (contains(item.getBrand(), query)) score += 3;
        }

        if (brand != null && !brand.isBlank()) {
            if (contains(item.getBrand(), normalize(brand))) {
                score += 8;
            }
        }

        if (categories != null && !categories.isEmpty()) {
            for (String category : categories) {
                String normalizedCategory = normalize(category);

                if (contains(item.getCategory(), normalizedCategory)) {
                    score += 10;
                } else if (isRelatedCategory(item.getCategory(), normalizedCategory)) {
                    score += 4;
                }
            }
        }

        if (roomTypes != null && !roomTypes.isEmpty()) {
            for (String roomType : roomTypes) {
                String normalizedRoomType = normalize(roomType);

                if (contains(item.getRoomType(), normalizedRoomType)) {
                    score += 6;
                } else if (isRelatedRoomType(item.getRoomType(), normalizedRoomType)) {
                    score += 3;
                }
            }
        }

        if (styles != null && !styles.isEmpty()) {
            for (String style : styles) {
                String normalizedStyle = normalize(style);

                if (contains(item.getStyle(), normalizedStyle)) {
                    score += 10;
                } else if (isRelatedStyle(item.getStyle(), normalizedStyle)) {
                    score += 5;
                }
            }
        }

        if (colors != null && !colors.isEmpty()) {
            for (String color : colors) {
                String normalizedColor = normalize(color);

                if (contains(item.getColor(), normalizedColor)) {
                    score += 8;
                } else if (isRelatedColor(item.getColor(), normalizedColor)) {
                    score += 4;
                }
            }
        }

        if (isWithinPriceRange(item, minPrice, maxPrice)) {
            score += 3;
        } else if (minPrice != null || maxPrice != null) {
            score -= 5;
        }

        return score;
    }

    private void sortScoredItems(List<ScoredFurnitureItem> scoredItems, String sortBy) {
        if ("price-high-to-low".equals(sortBy)) {
            scoredItems.sort(
                    Comparator.comparing(
                            (ScoredFurnitureItem scored) -> getSafePrice(scored.item())
                    ).reversed()
            );
        } else if ("price-low-to-high".equals(sortBy)) {
            scoredItems.sort(
                    Comparator.comparing(scored -> getSafePrice(scored.item()))
            );
        } else {
            scoredItems.sort(
                    Comparator.comparingInt(ScoredFurnitureItem::score).reversed()
            );
        }
    }

    private boolean isWithinPriceRange(FurnitureItem item, Integer minPrice, Integer maxPrice) {
        if (item.getPrice() == null) {
            return true;
        }

        if (minPrice != null && item.getPrice().compareTo(BigDecimal.valueOf(minPrice)) < 0) {
            return false;
        }

        if (maxPrice != null && item.getPrice().compareTo(BigDecimal.valueOf(maxPrice)) > 0) {
            return false;
        }

        return true;
    }

    private boolean isRelatedCategory(String itemCategory, String selectedCategory) {
        String category = normalize(itemCategory);

        Map<String, List<String>> related = Map.of(
                "CHAIR", List.of("SOFA", "BENCH", "STORAGE"),
                "SOFA", List.of("CHAIR", "BENCH", "TABLE"),
                "BED", List.of("STORAGE", "BENCH", "TABLE"),
                "TABLE", List.of("CHAIR", "SOFA", "STORAGE"),
                "STORAGE", List.of("TABLE", "BED", "CHAIR", "SOFA"),
                "BENCH", List.of("BED", "CHAIR", "SOFA"),
                "SEATING", List.of("CHAIR", "SOFA", "BENCH"),
                "SHELVING", List.of("STORAGE", "BOOKCASE", "BOOKSHELF"),
                "DECOR", List.of("TABLE", "STORAGE", "LIGHTING"),
                "OFFICE", List.of("DESK", "CHAIR", "STORAGE")
        );

        return related.getOrDefault(selectedCategory, List.of())
                .stream()
                .anyMatch(category::contains);
    }

    private boolean isRelatedStyle(String itemStyle, String selectedStyle) {
        String style = normalize(itemStyle);

        Map<String, List<String>> related = Map.of(
                "MODERN", List.of("MINIMALIST", "SCANDINAVIAN", "MID CENTURY", "JAPANDI"),
                "MINIMALIST", List.of("MODERN", "SCANDINAVIAN", "JAPANDI"),
                "SCANDINAVIAN", List.of("MODERN", "MINIMALIST", "JAPANDI"),
                "JAPANDI", List.of("SCANDINAVIAN", "MINIMALIST", "MODERN"),
                "MID CENTURY", List.of("MODERN", "INDUSTRIAL"),
                "BOHO", List.of("JAPANDI", "SCANDINAVIAN"),
                "INDUSTRIAL", List.of("MODERN", "MID CENTURY")
        );

        return related.getOrDefault(selectedStyle, List.of())
                .stream()
                .anyMatch(style::contains);
    }

    private boolean isRelatedColor(String itemColor, String selectedColor) {
        String color = normalize(itemColor);

        Map<String, List<String>> related = Map.of(
                "WARM NEUTRAL", List.of("BEIGE", "CREAM", "IVORY", "TAN", "BROWN", "NATURAL"),
                "COOL NEUTRAL", List.of("GRAY", "WHITE", "BLACK", "SILVER"),
                "EARTHY", List.of("GREEN", "BROWN", "NATURAL", "OAK", "WALNUT"),
                "B & W", List.of("BLACK", "WHITE", "GRAY"),
                "BEIGE", List.of("CREAM", "IVORY", "WHITE", "TAN", "BROWN", "NATURAL"),
                "WHITE", List.of("IVORY", "CREAM", "BEIGE", "NATURAL"),
                "BLACK", List.of("GRAY", "DARK GRAY", "BROWN"),
                "GRAY", List.of("BLACK", "WHITE", "BEIGE", "SILVER"),
                "BROWN", List.of("TAN", "BEIGE", "WALNUT", "OAK", "NATURAL"),
                "GREEN", List.of("EARTHY", "BROWN", "NATURAL")
        );

        return related.getOrDefault(selectedColor, List.of())
                .stream()
                .anyMatch(color::contains);
    }

    private boolean isRelatedRoomType(String itemRoomType, String selectedRoomType) {
        String roomType = normalize(itemRoomType);

        if (selectedRoomType.contains("LIVING")) {
            return roomType.contains("DINING") || roomType.contains("OFFICE");
        }

        if (selectedRoomType.contains("BEDROOM")) {
            return roomType.contains("OFFICE") || roomType.contains("LIVING");
        }

        if (selectedRoomType.contains("OFFICE")) {
            return roomType.contains("BEDROOM") || roomType.contains("LIVING");
        }

        return false;
    }

    private boolean contains(String value, String target) {
        if (value == null || target == null) {
            return false;
        }

        return normalize(value).contains(target);
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value.toUpperCase()
                .replace("_", " ")
                .replace("-", " ")
                .replace(",", " ")
                .trim();
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }

        return Arrays.stream(
                        json.replace("[", "")
                                .replace("]", "")
                                .replace("\"", "")
                                .split(",")
                )
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private BigDecimal getSafePrice(FurnitureItem item) {
        return item.getPrice() == null ? BigDecimal.valueOf(Integer.MAX_VALUE) : item.getPrice();
    }

    private boolean noFiltersApplied(
            String q,
            String brand,
            List<String> category,
            List<String> roomType,
            List<String> style,
            List<String> color,
            Integer minPrice,
            Integer maxPrice
    ) {
        return (q == null || q.isBlank())
                && (brand == null || brand.isBlank())
                && (category == null || category.isEmpty())
                && (roomType == null || roomType.isEmpty())
                && (style == null || style.isEmpty())
                && (color == null || color.isEmpty())
                && minPrice == null
                && maxPrice == null;
    }

    private record ScoredFurnitureItem(FurnitureItem item, int score) {}
}
