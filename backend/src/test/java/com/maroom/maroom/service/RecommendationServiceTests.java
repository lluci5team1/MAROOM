package com.maroom.maroom.service;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.repository.SwipeEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RecommendationServiceTests {

    private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
    private final FurnitureItemRepository furnitureItemRepository = mock(FurnitureItemRepository.class);
    private final SwipeEventRepository swipeEventRepository = mock(SwipeEventRepository.class);

    private final RecommendationService recommendationService = new RecommendationService(
            jdbcTemplate,
            furnitureItemRepository,
            swipeEventRepository,
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
                eq(2)
        )).thenReturn(List.of(rankedItem));
        when(swipeEventRepository.findFurnitureIdsByUserId(userId)).thenReturn(List.of());
        when(furnitureItemRepository.findAll()).thenReturn(List.of(rankedItem, fallbackItem));

        List<FurnitureItem> feed = recommendationService.getFeedForUser(userId, 2);

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

        List<FurnitureItem> feed = recommendationService.getFeedForUser(userId, 10);

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

        recommendationService.getFeedForUser(userId, 500);

        verify(jdbcTemplate).query(
                anyString(),
                any(RowMapper.class),
                eq(userId),
                eq("voyage-multimodal-3.5"),
                eq(1024),
                eq(100)
        );
    }

    private FurnitureItem furnitureItem(String title) {
        FurnitureItem item = new FurnitureItem();
        item.setId(UUID.randomUUID());
        item.setTitle(title);
        return item;
    }
}
