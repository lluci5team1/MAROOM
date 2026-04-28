package com.maroom.maroom.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class UserEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(UserEmbeddingService.class);

    private final JdbcTemplate jdbcTemplate;
    private final String model;
    private final int outputDimension;
    private final double leftPenalty;

    private boolean storageInitialized;
    private boolean storageInitializationAttempted;

    public UserEmbeddingService(
            JdbcTemplate jdbcTemplate,
            @Value("${maroom.embeddings.voyage.model:voyage-multimodal-3.5}") String model,
            @Value("${maroom.embeddings.output-dimension:1024}") int outputDimension,
            @Value("${maroom.user-embeddings.left-penalty:0.25}") double leftPenalty
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.model = model;
        this.outputDimension = outputDimension;
        this.leftPenalty = leftPenalty;
    }

    public record RecomputeResult(
            boolean storageReady,
            boolean updated,
            UUID userId,
            int positiveCount,
            int negativeCount,
            int swipedEmbeddingCount,
            int skippedMissingFurnitureEmbeddings
    ) {}

    public RecomputeResult recomputeUserEmbedding(UUID userId) {
        if (userId == null) {
            return new RecomputeResult(false, false, null, 0, 0, 0, 0);
        }

        try {
            if (!ensureStorage()) {
                return new RecomputeResult(false, false, userId, 0, 0, 0, 0);
            }

            List<SwipedEmbedding> swipedEmbeddings = findSwipedEmbeddings(userId);
            int totalSwipes = countUserSwipes(userId);
            int skipped = Math.max(0, totalSwipes - swipedEmbeddings.size());

            double[] positiveSum = new double[outputDimension];
            double[] negativeSum = new double[outputDimension];
            int positiveCount = 0;
            int negativeCount = 0;

            for (SwipedEmbedding row : swipedEmbeddings) {
                double[] vector = parseVector(row.embedding());
                if ("RIGHT".equals(row.direction())) {
                    add(positiveSum, vector);
                    positiveCount++;
                } else if ("LEFT".equals(row.direction())) {
                    add(negativeSum, vector);
                    negativeCount++;
                }
            }

            if (positiveCount == 0 && negativeCount == 0) {
                deleteUserEmbedding(userId);
                return new RecomputeResult(true, false, userId, 0, 0, 0, skipped);
            }

            double[] userVector = buildUserVector(positiveSum, positiveCount, negativeSum, negativeCount);
            if (isZeroVector(userVector)) {
                deleteUserEmbedding(userId);
                return new RecomputeResult(true, false, userId, positiveCount, negativeCount,
                        swipedEmbeddings.size(), skipped);
            }

            upsertUserEmbedding(userId, userVector, positiveCount, negativeCount, swipedEmbeddings.size());
            return new RecomputeResult(true, true, userId, positiveCount, negativeCount,
                    swipedEmbeddings.size(), skipped);
        } catch (Exception e) {
            log.warn("Failed to recompute user embedding for {}: {}", userId, e.getMessage());
            return new RecomputeResult(false, false, userId, 0, 0, 0, 0);
        }
    }

    private synchronized boolean ensureStorage() {
        if (storageInitialized) {
            return true;
        }
        if (storageInitializationAttempted) {
            return false;
        }

        storageInitializationAttempted = true;
        try {
            validateOutputDimension();
            jdbcTemplate.execute("create extension if not exists vector");
            jdbcTemplate.execute("""
                    create table if not exists user_embeddings (
                        user_id uuid primary key references app_user(id) on delete cascade,
                        embedding vector(%d) not null,
                        embedding_model text not null,
                        embedding_dim integer not null,
                        positive_count integer not null,
                        negative_count integer not null,
                        swiped_embedding_count integer not null,
                        left_penalty double precision not null,
                        created_at timestamptz not null default now(),
                        updated_at timestamptz not null default now()
                    )
                    """.formatted(outputDimension));
            storageInitialized = true;
            return true;
        } catch (Exception e) {
            log.warn("User embedding storage is not available: {}", e.getMessage());
            return false;
        }
    }

    private void validateOutputDimension() {
        if (outputDimension != 256
                && outputDimension != 512
                && outputDimension != 1024
                && outputDimension != 2048) {
            throw new IllegalArgumentException("Unsupported embedding dimension: " + outputDimension);
        }
    }

    private List<SwipedEmbedding> findSwipedEmbeddings(UUID userId) {
        return jdbcTemplate.query("""
                        select s.direction, fe.combined_embedding::text
                        from swipe_event s
                        join furniture_embeddings fe on fe.furniture_id = s.furniture_id
                        where s.user_id = ?
                          and fe.embedding_model = ?
                          and fe.embedding_dim = ?
                        order by s.created_at asc
                        """,
                (rs, rowNum) -> new SwipedEmbedding(rs.getString(1), rs.getString(2)),
                userId,
                model,
                outputDimension);
    }

    private int countUserSwipes(UUID userId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from swipe_event where user_id = ?",
                Integer.class,
                userId);
        return count == null ? 0 : count;
    }

    private double[] buildUserVector(
            double[] positiveSum,
            int positiveCount,
            double[] negativeSum,
            int negativeCount
    ) {
        double[] vector = new double[outputDimension];

        if (positiveCount > 0) {
            for (int i = 0; i < outputDimension; i++) {
                vector[i] += positiveSum[i] / positiveCount;
            }
        }

        if (negativeCount > 0) {
            for (int i = 0; i < outputDimension; i++) {
                vector[i] -= leftPenalty * (negativeSum[i] / negativeCount);
            }
        }

        return normalize(vector);
    }

    private void add(double[] target, double[] source) {
        for (int i = 0; i < outputDimension; i++) {
            target[i] += source[i];
        }
    }

    private double[] normalize(double[] vector) {
        double norm = 0;
        for (double value : vector) {
            norm += value * value;
        }
        norm = Math.sqrt(norm);
        if (norm == 0) {
            return vector;
        }

        double[] normalized = new double[vector.length];
        for (int i = 0; i < vector.length; i++) {
            normalized[i] = vector[i] / norm;
        }
        return normalized;
    }

    private boolean isZeroVector(double[] vector) {
        for (double value : vector) {
            if (value != 0) {
                return false;
            }
        }
        return true;
    }

    private double[] parseVector(String value) {
        String cleaned = value.trim();
        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }

        String[] parts = cleaned.split(",");
        if (parts.length != outputDimension) {
            throw new IllegalStateException(
                    "Expected " + outputDimension + " vector values, got " + parts.length
            );
        }

        double[] vector = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vector[i] = Double.parseDouble(parts[i].trim());
        }
        return vector;
    }

    private void upsertUserEmbedding(
            UUID userId,
            double[] embedding,
            int positiveCount,
            int negativeCount,
            int swipedEmbeddingCount
    ) {
        jdbcTemplate.update("""
                        insert into user_embeddings (
                            user_id,
                            embedding,
                            embedding_model,
                            embedding_dim,
                            positive_count,
                            negative_count,
                            swiped_embedding_count,
                            left_penalty
                        )
                        values (?, ?::vector, ?, ?, ?, ?, ?, ?)
                        on conflict (user_id) do update set
                            embedding = excluded.embedding,
                            embedding_model = excluded.embedding_model,
                            embedding_dim = excluded.embedding_dim,
                            positive_count = excluded.positive_count,
                            negative_count = excluded.negative_count,
                            swiped_embedding_count = excluded.swiped_embedding_count,
                            left_penalty = excluded.left_penalty,
                            updated_at = now()
                        """,
                userId,
                toVectorLiteral(embedding),
                model,
                outputDimension,
                positiveCount,
                negativeCount,
                swipedEmbeddingCount,
                leftPenalty);
    }

    private void deleteUserEmbedding(UUID userId) {
        jdbcTemplate.update("delete from user_embeddings where user_id = ?", userId);
    }

    private String toVectorLiteral(double[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(String.format(Locale.US, "%.9f", vector[i]));
        }
        return sb.append(']').toString();
    }

    private record SwipedEmbedding(String direction, String embedding) {}
}
