package com.maroom.maroom.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;

@Service
public class FurnitureImportService {

    private final SerpApiService serpApiService;
    private final FurnitureItemRepository furnitureItemRepository;
    private final FurnitureEmbeddingService furnitureEmbeddingService;

    public FurnitureImportService(
            SerpApiService serpApiService,
            FurnitureItemRepository furnitureItemRepository,
            FurnitureEmbeddingService furnitureEmbeddingService
    ) {
        this.serpApiService = serpApiService;
        this.furnitureItemRepository = furnitureItemRepository;
        this.furnitureEmbeddingService = furnitureEmbeddingService;
    }

    public ImportResult importLargeDataset(int requestedQueryLimit, boolean embedNewItems, boolean randomizeQueries) {
        List<ImportQuery> queries = buildImportQueries();
        if (randomizeQueries) {
            Collections.shuffle(queries);
        }

        int queryLimit = Math.max(1, Math.min(requestedQueryLimit, queries.size()));
        int savedCount = 0;
        int fetchedCount = 0;
        int duplicateCount = 0;
        int invalidCount = 0;
        int failedQueryCount = 0;
        int embeddedCount = 0;
        Set<String> seenProductUrls = new HashSet<>();

        for (ImportQuery query : queries.subList(0, queryLimit)) {
            List<FurnitureItem> items;
            try {
                items = serpApiService.searchFurniture(
                        query.query(),
                        query.category(),
                        query.style(),
                        query.color(),
                        query.roomType()
                );
            } catch (Exception e) {
                failedQueryCount++;
                continue;
            }

            fetchedCount += items.size();

            for (FurnitureItem item : items) {
                if (!hasText(item.getProductUrl()) || !hasText(item.getImageUrl()) || !hasText(item.getTitle())) {
                    invalidCount++;
                    continue;
                }

                if (!seenProductUrls.add(item.getProductUrl())
                        || furnitureItemRepository.existsByProductUrl(item.getProductUrl())) {
                    duplicateCount++;
                    continue;
                }

                FurnitureItem savedItem = furnitureItemRepository.save(item);
                savedCount++;

                if (embedNewItems && furnitureEmbeddingService.embedFurniture(savedItem)) {
                    embeddedCount++;
                }
            }
        }

        return new ImportResult(
                queryLimit,
                fetchedCount,
                savedCount,
                duplicateCount,
                invalidCount,
                failedQueryCount,
                embeddedCount,
                embedNewItems,
                randomizeQueries
        );
    }

    private List<ImportQuery> buildImportQueries() {
        List<String> styles = List.of(
                "Modern",
                "Minimalist",
                "Scandinavian",
                "Mid-Century",
                "Boho",
                "Industrial",
                "Japandi"
        );
        List<ColorQuery> colors = List.of(
                new ColorQuery("Warm Neutral", "beige"),
                new ColorQuery("Cool Neutral", "gray"),
                new ColorQuery("Earthy", "sage green"),
                new ColorQuery("B & W", "black white"),
                new ColorQuery("Pastel", "pastel"),
                new ColorQuery("Vibrant", "colorful")
        );
        List<QuerySeed> seeds = List.of(
                new QuerySeed("sofa", "Seating", "Living Room"),
                new QuerySeed("loveseat", "Seating", "Living Room"),
                new QuerySeed("accent chair", "Seating", "Living Room"),
                new QuerySeed("dining chair", "Seating", "Dining Room"),
                new QuerySeed("bar stool", "Seating", "Dining Room"),
                new QuerySeed("office chair", "Office", "Office"),
                new QuerySeed("platform bed frame", "Beds", "Bedroom"),
                new QuerySeed("bed frame", "Beds", "Bedroom"),
                new QuerySeed("nightstand", "Tables", "Bedroom"),
                new QuerySeed("coffee table", "Tables", "Living Room"),
                new QuerySeed("side table", "Tables", "Living Room"),
                new QuerySeed("dining table", "Tables", "Dining Room"),
                new QuerySeed("desk", "Office", "Office"),
                new QuerySeed("dresser", "Storage", "Bedroom"),
                new QuerySeed("storage cabinet", "Storage", "Living Room"),
                new QuerySeed("tv stand", "Storage", "Living Room"),
                new QuerySeed("wardrobe", "Storage", "Bedroom"),
                new QuerySeed("bookshelf", "Shelving", "Living Room"),
                new QuerySeed("bookcase", "Shelving", "Office"),
                new QuerySeed("wall shelf", "Shelving", "Living Room"),
                new QuerySeed("floor lamp", "Decor", "Living Room"),
                new QuerySeed("table lamp", "Decor", "Bedroom"),
                new QuerySeed("area rug", "Decor", "Living Room"),
                new QuerySeed("mirror", "Decor", "Bedroom"),
                new QuerySeed("patio chair", "Seating", "Outdoor"),
                new QuerySeed("outdoor table", "Tables", "Outdoor")
        );

        List<ImportQuery> queries = new ArrayList<>();

        for (String style : styles) {
            for (ColorQuery color : colors) {
                for (QuerySeed seed : seeds) {
                    queries.add(new ImportQuery(
                            buildSearchQuery(style, color.searchTerm(), seed.searchTerm(), seed.roomType()),
                            seed.category(),
                            style,
                            color.label(),
                            seed.roomType()
                    ));
                }
            }
        }

        return queries;
    }

    private String buildSearchQuery(
            String style,
            String colorSearchTerm,
            String searchTerm,
            String roomType
    ) {
        return String.join(" ", style, colorSearchTerm, searchTerm, "furniture", roomType);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public record ImportResult(
            int queriesRun,
            int fetchedCount,
            int savedCount,
            int duplicateCount,
            int invalidCount,
            int failedQueryCount,
            int embeddedCount,
            boolean embedRequested,
            boolean randomized
    ) {}

    private record ImportQuery(
            String query,
            String category,
            String style,
            String color,
            String roomType
    ) {}

    private record QuerySeed(
            String searchTerm,
            String category,
            String roomType
    ) {}

    private record ColorQuery(
            String label,
            String searchTerm
    ) {}
}
