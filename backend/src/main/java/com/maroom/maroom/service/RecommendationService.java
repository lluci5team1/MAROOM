package com.maroom.maroom.service;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.repository.SwipeEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);
    private static final int MAX_FEED_SIZE = 100;

    private final JdbcTemplate jdbcTemplate;
    private final FurnitureItemRepository furnitureItemRepository;
    private final SwipeEventRepository swipeEventRepository;
    private final String model;
    private final int outputDimension;

    public RecommendationService(
            JdbcTemplate jdbcTemplate,
            FurnitureItemRepository furnitureItemRepository,
            SwipeEventRepository swipeEventRepository,
            @Value("${maroom.embeddings.voyage.model:voyage-multimodal-3.5}") String model,
            @Value("${maroom.embeddings.output-dimension:1024}") int outputDimension
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.furnitureItemRepository = furnitureItemRepository;
        this.swipeEventRepository = swipeEventRepository;
        this.model = model;
        this.outputDimension = outputDimension;
    }

    public List<FurnitureItem> getFeedForUser(UUID userId, int requestedSize) {
        int size = normalizeSize(requestedSize);
        if (size == 0) {
            return List.of();
        }

        List<FurnitureItem> rankedItems = findRankedByEmbedding(userId, size);
        if (rankedItems.size() >= size) {
            return rankedItems;
        }

        return fillWithFallbackItems(userId, size, rankedItems);
    }

    private List<FurnitureItem> findRankedByEmbedding(UUID userId, int size) {
        if (userId == null || !embeddingTablesExist()) {
            return List.of();
        }

        try {
            return jdbcTemplate.query("""
                            select
                                fi.id,
                                fi.title,
                                fi.category,
                                fi.brand,
                                fi.style,
                                fi.color,
                                fi.price,
                                fi.room_type,
                                fi.product_url,
                                fi.image_url
                            from user_embeddings ue
                            join furniture_embeddings fe
                              on fe.embedding_model = ue.embedding_model
                             and fe.embedding_dim = ue.embedding_dim
                            join furniture_items fi
                              on fi.id = fe.furniture_id
                            left join swipe_event se
                              on se.user_id = ue.user_id
                             and se.furniture_id = fi.id
                            where ue.user_id = ?
                              and ue.embedding_model = ?
                              and ue.embedding_dim = ?
                              and se.id is null
                            order by fe.combined_embedding <=> ue.embedding
                            limit ?
                            """,
                    furnitureItemRowMapper(),
                    userId,
                    model,
                    outputDimension,
                    size);
        } catch (Exception e) {
            log.warn("Failed to build embedding-ranked feed for {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    private boolean embeddingTablesExist() {
        try {
            Boolean exists = jdbcTemplate.queryForObject("""
                            select to_regclass('public.user_embeddings') is not null
                               and to_regclass('public.furniture_embeddings') is not null
                            """,
                    Boolean.class);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            log.warn("Embedding tables are not available for recommendations: {}", e.getMessage());
            return false;
        }
    }

    private List<FurnitureItem> fillWithFallbackItems(
            UUID userId,
            int size,
            List<FurnitureItem> rankedItems
    ) {
        Set<UUID> usedIds = new LinkedHashSet<>();
        List<FurnitureItem> feed = new ArrayList<>();

        for (FurnitureItem item : rankedItems) {
            if (item.getId() != null && usedIds.add(item.getId())) {
                feed.add(item);
            }
        }

        Set<UUID> excludedIds = new HashSet<>(usedIds);
        if (userId != null) {
            excludedIds.addAll(swipeEventRepository.findFurnitureIdsByUserId(userId));
        }

        List<FurnitureItem> fallbackItems = new ArrayList<>(furnitureItemRepository.findAll());
        fallbackItems.removeIf(item -> item.getId() != null && excludedIds.contains(item.getId()));
        Collections.shuffle(fallbackItems);

        for (FurnitureItem item : fallbackItems) {
            if (feed.size() >= size) {
                break;
            }
            feed.add(item);
        }

        return feed;
    }

    private int normalizeSize(int requestedSize) {
        if (requestedSize <= 0) {
            return 0;
        }
        return Math.min(requestedSize, MAX_FEED_SIZE);
    }

    private RowMapper<FurnitureItem> furnitureItemRowMapper() {
        return (rs, rowNum) -> {
            FurnitureItem item = new FurnitureItem();
            item.setId(rs.getObject("id", UUID.class));
            item.setTitle(rs.getString("title"));
            item.setCategory(rs.getString("category"));
            item.setBrand(rs.getString("brand"));
            item.setStyle(rs.getString("style"));
            item.setColor(rs.getString("color"));

            int price = rs.getInt("price");
            item.setPrice(rs.wasNull() ? null : price);

            item.setRoomType(rs.getString("room_type"));
            item.setProductUrl(rs.getString("product_url"));
            item.setImageUrl(rs.getString("image_url"));
            return item;
        };
    }
}
