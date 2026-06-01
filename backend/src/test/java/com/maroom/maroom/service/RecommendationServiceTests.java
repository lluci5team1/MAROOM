package com.maroom.maroom.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.repository.PreferenceRepository;
import com.maroom.maroom.repository.SwipeEventRepository;

class RecommendationServiceTests {

    private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
    private final FurnitureItemRepository furnitureItemRepository = mock(FurnitureItemRepository.class);
    private final SwipeEventRepository swipeEventRepository = mock(SwipeEventRepository.class);
    private final PreferenceRepository preferenceRepository = mock(PreferenceRepository.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final RecommendationService recommendationService = new RecommendationService(
            jdbcTemplate,
            furnitureItemRepository,
            swipeEventRepository,
            preferenceRepository,
            objectMapper,
            "voyage-multimodal-3.5",
            1024
    );

    @Test
    void returnsEmbeddingRankedItemsFirst() {
        UUID userId = UUID.randomUUID();
        FurnitureItem rankedItem = furnitureItem("Ranked chair");
        FurnitureItem fallbackItem = furnitureItem("Fallback lamp");

        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(jdbcTemplate.query(
                anyString(),
                any(RowMapper.class),
                eq(userId),
                eq("voyage-multimodal-3.5"),
                eq(1024),
                eq(10)
        )).thenReturn(List.of(rankedItem));
        when(swipeEventRepository.findFurnitureIdsByUserId(userId)).thenReturn(List.of());
        when(furnitureItemRepository.findAll()).thenReturn(List.of(rankedItem, fallbackItem));

        List<FurnitureItem> feed = recommendationService.getRecommendationsForUser(userId, 2);

        assertThat(feed).containsExactly(rankedItem, fallbackItem);
    }

    @Test
    void fallsBackToUnswipedFurnitureWhenEmbeddingsAreUnavailable() {
        UUID userId = UUID.randomUUID();
        FurnitureItem swipedItem = furnitureItem("Swiped table");
        FurnitureItem unswipedItem = furnitureItem("Unswiped desk");

        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class))).thenReturn(false);
        when(swipeEventRepository.findFurnitureIdsByUserId(userId)).thenReturn(List.of(swipedItem.getId()));
        when(furnitureItemRepository.findAll()).thenReturn(List.of(swipedItem, unswipedItem));

        List<FurnitureItem> feed = recommendationService.getRecommendationsForUser(userId, 10);

        assertThat(feed).containsExactly(unswipedItem);
    }

    @Test
    void capsRequestedFeedSize() {
        UUID userId = UUID.randomUUID();

        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(jdbcTemplate.query(
                anyString(),
                any(RowMapper.class),
                eq(userId),
                eq("voyage-multimodal-3.5"),
                eq(1024),
                anyInt()
        )).thenReturn(List.of());
        when(swipeEventRepository.findFurnitureIdsByUserId(userId)).thenReturn(List.of());
        when(furnitureItemRepository.findAll()).thenReturn(List.of());

        recommendationService.getRecommendationsForUser(userId, 500);

        verify(jdbcTemplate).query(
                anyString(),
                any(RowMapper.class),
                eq(userId),
                eq("voyage-multimodal-3.5"),
                eq(1024),
                eq(500)
        );
    }

    @Test
    void deduplicatesRankedItemsByProductIdentity() {
        UUID userId = UUID.randomUUID();
        FurnitureItem rankedItem = furnitureItem("Same lamp");
        FurnitureItem duplicateItem = furnitureItem("Same lamp");
        FurnitureItem anotherItem = furnitureItem("Another chair");

        rankedItem.setImageUrl("https://cdn.example.com/products/same-lamp.jpg?size=large");
        duplicateItem.setImageUrl("https://cdn.example.com/products/same-lamp.jpg?size=small");
        anotherItem.setImageUrl("https://cdn.example.com/products/another-chair.jpg");

        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(jdbcTemplate.query(
                anyString(),
                any(RowMapper.class),
                eq(userId),
                eq("voyage-multimodal-3.5"),
                eq(1024),
                eq(15)
        )).thenReturn(List.of(rankedItem, duplicateItem, anotherItem));
        when(swipeEventRepository.findFurnitureIdsByUserId(userId)).thenReturn(List.of());
        when(furnitureItemRepository.findAll()).thenReturn(List.of());

        List<FurnitureItem> feed = recommendationService.getRecommendationsForUser(userId, 3);

        assertThat(feed).containsExactly(rankedItem, anotherItem);
    }

    private FurnitureItem furnitureItem(String title) {
        FurnitureItem item = new FurnitureItem();
        item.setId(UUID.randomUUID());
        item.setTitle(title);
        return item;
    }
}
