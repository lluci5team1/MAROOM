package com.maroom.maroom.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.domain.Preference;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.repository.PreferenceRepository;
import com.maroom.maroom.repository.SwipeEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);
    private static final int MAX_FEED_SIZE = 100;
    private static final int MAX_QUERY_CANDIDATES = 500;

    private final JdbcTemplate jdbcTemplate;
    private final FurnitureItemRepository furnitureItemRepository;
    private final SwipeEventRepository swipeEventRepository;
    private final PreferenceRepository preferenceRepository;
    private final ObjectMapper objectMapper;
    private final String model;
    private final int outputDimension;

    public RecommendationService(
            JdbcTemplate jdbcTemplate,
            FurnitureItemRepository furnitureItemRepository,
            SwipeEventRepository swipeEventRepository,
            PreferenceRepository preferenceRepository,
            ObjectMapper objectMapper,
            @Value("${maroom.embeddings.voyage.model:voyage-multimodal-3.5}") String model,
            @Value("${maroom.embeddings.output-dimension:1024}") int outputDimension
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.furnitureItemRepository = furnitureItemRepository;
        this.swipeEventRepository = swipeEventRepository;
        this.preferenceRepository = preferenceRepository;
        this.objectMapper = objectMapper;
        this.model = model;
        this.outputDimension = outputDimension;
    }

    public List<FurnitureItem> getFeedForUser(UUID userId, int requestedSize) {
        return getRandomFeedForUser(userId, requestedSize);
    }

    public List<FurnitureItem> getRandomFeedForUser(UUID userId, int requestedSize) {
        int size = normalizeSize(requestedSize);
        if (size == 0) {
            return List.of();
        }

        try {
            int candidateLimit = candidateLimit(size);
            List<FurnitureItem> candidates;

            if (userId == null) {
                candidates = jdbcTemplate.query("""
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
                                from furniture_items fi
                                order by random()
                                limit ?
                                """,
                        furnitureItemRowMapper(),
                        candidateLimit);
            } else {
                candidates = jdbcTemplate.query("""
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
                                from furniture_items fi
                                where not exists (
                                    select 1
                                    from swipe_event se
                                    where se.user_id = ?
                                      and se.furniture_id = fi.id
                                )
                                  and not exists (
                                    select 1
                                    from saved_list sl
                                    join saved_item si on si.saved_list_id = sl.id
                                    where sl.user_id = ?
                                      and si.furniture_id = fi.id
                                )
                                order by random()
                                limit ?
                                """,
                        furnitureItemRowMapper(),
                        userId,
                        userId,
                        candidateLimit);
            }

            List<FurnitureItem> feed = deduplicateAndLimit(candidates, size);
            if (feed.size() >= size) {
                return feed;
            }

            return fillWithFallbackItems(userId, size, feed, false);
        } catch (Exception e) {
            log.warn("Failed to build random feed for {}: {}", userId, e.getMessage());
            return fillWithFallbackItems(userId, size, List.of(), false);
        }
    }

    public List<FurnitureItem> getRecommendationsForUser(UUID userId, int requestedSize) {
        int size = normalizeSize(requestedSize);
        if (size == 0) {
            return List.of();
        }

        List<FurnitureItem> rankedItems = deduplicateAndLimit(
                findRankedByEmbedding(userId, candidateLimit(size)),
                size
        );
        if (rankedItems.size() >= size) {
            return rankedItems;
        }

        return fillWithFallbackItems(userId, size, rankedItems, true);
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
                              and not exists (
                                  select 1
                                  from saved_list sl
                                  join saved_item si on si.saved_list_id = sl.id
                                  where sl.user_id = ue.user_id
                                    and si.furniture_id = fi.id
                              )
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
            List<FurnitureItem> rankedItems,
            boolean usePreferenceSort
    ) {
        Set<UUID> usedIds = new LinkedHashSet<>();
        Set<String> usedIdentityKeys = new LinkedHashSet<>();
        List<FurnitureItem> feed = new ArrayList<>();

        for (FurnitureItem item : rankedItems) {
            addUniqueFurniture(feed, usedIds, usedIdentityKeys, item, size);
        }

        Set<UUID> excludedIds = new HashSet<>(usedIds);
        if (userId != null) {
            excludedIds.addAll(findExcludedFurnitureIds(userId));
        }

        List<FurnitureItem> fallbackItems = new ArrayList<>(furnitureItemRepository.findAll());
        fallbackItems.removeIf(item -> item.getId() != null && excludedIds.contains(item.getId()));

        Optional<Preference> preference = userId == null
                ? Optional.empty()
                : preferenceRepository.findById(userId);

        if (usePreferenceSort && preference.isPresent()) {
            Preference userPreference = preference.get();
            List<String> preferredStyles = parseJsonList(userPreference.getStyles());
            List<String> preferredColors = parseJsonList(userPreference.getColorPalette());

            fallbackItems.sort(
                    Comparator.comparingInt((FurnitureItem item) ->
                            calculatePreferenceScore(
                                    item,
                                    userPreference,
                                    preferredStyles,
                                    preferredColors
                            )
                    ).reversed()
            );
        } else {
            Collections.shuffle(fallbackItems);
        }

        for (FurnitureItem item : fallbackItems) {
            addUniqueFurniture(feed, usedIds, usedIdentityKeys, item, size);
        }

        return feed;
    }

    private int calculatePreferenceScore(
            FurnitureItem item,
            Preference preference,
            List<String> preferredStyles,
            List<String> preferredColors
    ) {
        int score = 0;

        if (matchesAny(item.getStyle(), preferredStyles)) {
            score += 5;
        }

        if (matchesAny(item.getColor(), preferredColors)) {
            score += 3;
        }

        if (isWithinBudget(item, preference)) {
            score += 2;
        }

        if (matchesRoomType(item.getRoomType(), preference.getHomeType())) {
            score += 1;
        }

        return score;
    }

    private boolean isWithinBudget(FurnitureItem item, Preference preference) {
        if (item.getPrice() == null) {
            return true;
        }

        if (preference.getMinBudget() != null
                && item.getPrice().compareTo(BigDecimal.valueOf(preference.getMinBudget())) < 0) {
            return false;
        }

        if (preference.getMaxBudget() != null
                && item.getPrice().compareTo(BigDecimal.valueOf(preference.getMaxBudget())) > 0) {
            return false;
        }

        return true;
    }

    private boolean matchesAny(String itemValue, List<String> preferredValues) {
        if (itemValue == null || preferredValues == null || preferredValues.isEmpty()) {
            return false;
        }

        String normalizedItem = normalize(itemValue);

        return preferredValues.stream()
                .map(this::normalize)
                .anyMatch(normalizedItem::contains);
    }

    private boolean matchesRoomType(String itemRoomType, String homeType) {
        if (itemRoomType == null || homeType == null) {
            return false;
        }

        String room = normalize(itemRoomType);
        String home = normalize(homeType);

        if (home.contains("DORM") && (room.contains("DORM") || room.contains("BEDROOM"))) {
            return true;
        }

        if (home.contains("BEDROOM") && room.contains("BEDROOM")) {
            return true;
        }

        return room.contains(home) || home.contains(room);
    }

    private String normalize(String value) {
        return value.toUpperCase()
                .replace("_", " ")
                .replace("-", " ")
                .trim();
    }

    private List<String> parseJsonList(String json) {
        try {
            if (json == null || json.isBlank()) {
                return Collections.emptyList();
            }

            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private int normalizeSize(int requestedSize) {
        if (requestedSize <= 0) {
            return 0;
        }
        return Math.min(requestedSize, MAX_FEED_SIZE);
    }

    private int candidateLimit(int size) {
        return Math.min(MAX_QUERY_CANDIDATES, Math.max(size, size * 5));
    }

    private List<FurnitureItem> deduplicateAndLimit(List<FurnitureItem> items, int size) {
        Set<UUID> usedIds = new LinkedHashSet<>();
        Set<String> usedIdentityKeys = new LinkedHashSet<>();
        List<FurnitureItem> feed = new ArrayList<>();

        for (FurnitureItem item : items) {
            addUniqueFurniture(feed, usedIds, usedIdentityKeys, item, size);
        }

        return feed;
    }

    private void addUniqueFurniture(
            List<FurnitureItem> feed,
            Set<UUID> usedIds,
            Set<String> usedIdentityKeys,
            FurnitureItem item,
            int size
    ) {
        if (item == null || feed.size() >= size) {
            return;
        }

        UUID id = item.getId();
        if (id != null && usedIds.contains(id)) {
            return;
        }

        List<String> identityKeys = identityKeys(item);
        if (identityKeys.stream().anyMatch(usedIdentityKeys::contains)) {
            return;
        }

        if (id != null) {
            usedIds.add(id);
        }
        usedIdentityKeys.addAll(identityKeys);
        feed.add(item);
    }

    private List<String> identityKeys(FurnitureItem item) {
        List<String> keys = new ArrayList<>();
        addIdentityKey(keys, "url", item.getProductUrl());
        addIdentityKey(keys, "image", item.getImageUrl());

        String title = normalizeIdentity(item.getTitle());
        if (!title.isBlank()) {
            keys.add("title:" + title + "|brand:" + normalizeIdentity(item.getBrand()));
        }

        return keys;
    }

    private void addIdentityKey(List<String> keys, String prefix, String value) {
        String normalized = normalizeIdentity(value);
        if (!normalized.isBlank()) {
            keys.add(prefix + ":" + normalized);
        }
    }

    private String normalizeIdentity(String value) {
        if (value == null) {
            return "";
        }

        String normalized = value.toLowerCase(Locale.ROOT).trim();
        int queryStart = normalized.indexOf('?');
        if (queryStart >= 0) {
            normalized = normalized.substring(0, queryStart);
        }
        int fragmentStart = normalized.indexOf('#');
        if (fragmentStart >= 0) {
            normalized = normalized.substring(0, fragmentStart);
        }

        return normalized
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private Set<UUID> findExcludedFurnitureIds(UUID userId) {
        Set<UUID> excludedIds = new HashSet<>();

        List<UUID> swipedIds = swipeEventRepository.findFurnitureIdsByUserId(userId);
        if (swipedIds != null) {
            excludedIds.addAll(swipedIds);
        }

        try {
            List<UUID> savedIds = jdbcTemplate.queryForList("""
                            select si.furniture_id
                            from saved_item si
                            join saved_list sl on sl.id = si.saved_list_id
                            where sl.user_id = ?
                            """,
                    UUID.class,
                    userId);
            if (savedIds != null) {
                excludedIds.addAll(savedIds);
            }
        } catch (Exception e) {
            log.warn("Failed to load saved furniture exclusions for {}: {}", userId, e.getMessage());
        }

        return excludedIds;
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

            item.setPrice(rs.getBigDecimal("price"));

            item.setRoomType(rs.getString("room_type"));
            item.setProductUrl(rs.getString("product_url"));
            item.setImageUrl(rs.getString("image_url"));
            return item;
        };
    }
}
