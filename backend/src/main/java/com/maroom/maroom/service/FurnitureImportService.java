package com.maroom.maroom.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;

@Service
public class FurnitureImportService {

    private final SerpApiService serpApiService;
    private final FurnitureItemRepository furnitureItemRepository;

    public FurnitureImportService(
            SerpApiService serpApiService,
            FurnitureItemRepository furnitureItemRepository
    ) {
        this.serpApiService = serpApiService;
        this.furnitureItemRepository = furnitureItemRepository;
    }

    public int importLargeDataset() {
        List<ImportQuery> queries = buildImportQueries();
        int savedCount = 0;

        for (ImportQuery query : queries) {
            List<FurnitureItem> items = serpApiService.searchFurniture(
                    query.query(),
                    query.category(),
                    query.style(),
                    query.color(),
                    query.roomType()
            );

            List<FurnitureItem> newItems = new ArrayList<>();

            for (FurnitureItem item : items) {
                if (item.getProductUrl() != null &&
                        !furnitureItemRepository.existsByProductUrl(item.getProductUrl())) {
                    newItems.add(item);
                }
            }

            furnitureItemRepository.saveAll(newItems);
            savedCount += newItems.size();
        }

        return savedCount;
    }

    private List<ImportQuery> buildImportQueries() {
        List<String> styles = List.of("MODERN");
        List<String> colors = List.of("WARM_NEUTRAL");
        List<String> categories = List.of("chair");
        List<String> roomTypes = List.of("BEDROOM");

        List<ImportQuery> queries = new ArrayList<>();

        for (String style : styles) {
            for (String color : colors) {
                for (String category : categories) {
                    for (String roomType : roomTypes) {
                        String searchQuery = buildSearchQuery(style, color, category, roomType);

                        queries.add(new ImportQuery(
                                searchQuery,
                                category.toUpperCase().replace(" ", "_"),
                                style,
                                color,
                                roomType
                        ));
                    }
                }
            }
        }

        return queries;
    }

    private String buildSearchQuery(
            String style,
            String color,
            String category,
            String roomType
    ) {
        return "modern beige chair furniture";
    }

    private String readable(String value) {
        return value.toLowerCase().replace("_", " ");
    }

    private record ImportQuery(
            String query,
            String category,
            String style,
            String color,
            String roomType
    ) {}
}