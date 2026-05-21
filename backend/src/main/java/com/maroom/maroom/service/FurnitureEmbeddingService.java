package com.maroom.maroom.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;

@Service
public class FurnitureEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(FurnitureEmbeddingService.class);

    private final JdbcTemplate jdbcTemplate;
    private final FurnitureItemRepository furnitureItemRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final boolean enabled;
    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final int outputDimension;
    private final double imageWeight;
    private final double textWeight;

    private boolean storageInitialized;
    private boolean storageInitializationAttempted;

    public FurnitureEmbeddingService(
            JdbcTemplate jdbcTemplate,
            FurnitureItemRepository furnitureItemRepository,
            ObjectMapper objectMapper,
            @Value("${maroom.embeddings.enabled:true}") boolean enabled,
            @Value("${maroom.embeddings.voyage.api-key:${VOYAGE_API_KEY:}}") String apiKey,
            @Value("${maroom.embeddings.voyage.api-url:https://ai.mongodb.com/v1/multimodalembeddings}") String apiUrl,
            @Value("${maroom.embeddings.voyage.model:voyage-multimodal-3.5}") String model,
            @Value("${maroom.embeddings.output-dimension:1024}") int outputDimension,
            @Value("${maroom.embeddings.image-weight:0.7}") double imageWeight,
            @Value("${maroom.embeddings.text-weight:0.3}") double textWeight
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.furnitureItemRepository = furnitureItemRepository;
        this.objectMapper = objectMapper;
        this.enabled = enabled;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.apiUrl = apiUrl;
        this.model = model;
        this.outputDimension = outputDimension;
        this.imageWeight = imageWeight;
        this.textWeight = textWeight;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public record BackfillResult(
            boolean configured,
            boolean storageReady,
            int limit,
            int batchSize,
            int checked,
            int embedded,
            int skipped,
            int failed,
            int batches
    ) {}

    public boolean embedFurniture(FurnitureItem item) {
        if (!isConfigured() || item == null || item.getId() == null) {
            return false;
        }

        try {
            if (!ensureStorage()) {
                return false;
            }

            String contentHash = contentHash(item);
            if (hasCurrentEmbedding(item, contentHash)) {
                return false;
            }

            String text = toEmbeddingText(item);
            List<double[]> embeddings = requestEmbeddings(item.getImageUrl(), text);
            if (embeddings.isEmpty()) {
                return false;
            }

            double[] imageEmbedding;
            double[] textEmbedding;
            if (hasText(item.getImageUrl()) && embeddings.size() >= 2) {
                imageEmbedding = embeddings.get(0);
                textEmbedding = embeddings.get(1);
            } else {
                imageEmbedding = embeddings.get(0);
                textEmbedding = embeddings.get(0);
            }

            double[] combinedEmbedding = combine(imageEmbedding, textEmbedding);
            upsertEmbedding(item, imageEmbedding, textEmbedding, combinedEmbedding, contentHash);
            return true;
        } catch (Exception e) {
            log.warn("Failed to embed furniture item {}: {}", item.getId(), e.getMessage());
            return false;
        }
    }

    public BackfillResult backfillMissingEmbeddings(int requestedLimit) {
        return backfillMissingEmbeddings(requestedLimit, 25);
    }

    public BackfillResult backfillMissingEmbeddings(int requestedLimit, int requestedBatchSize) {
        int limit = Math.max(1, Math.min(requestedLimit, 500));
        int batchSize = Math.max(1, Math.min(requestedBatchSize, 50));
        return backfillCandidates(limit, batchSize, furnitureItemRepository::findAll);
    }

    public BackfillResult backfillMissingEmbeddingsWindow(
            int requestedLimit,
            int requestedBatchSize,
            int requestedOffset
    ) {
        int limit = Math.max(1, Math.min(requestedLimit, 500));
        int batchSize = Math.max(1, Math.min(requestedBatchSize, 50));
        int offset = Math.max(0, requestedOffset);
        return backfillCandidates(limit, batchSize, () -> furnitureItemRepository.findWindowById(offset, limit));
    }

    private BackfillResult backfillCandidates(
            int limit,
            int batchSize,
            Supplier<Iterable<FurnitureItem>> candidateSupplier
    ) {
        if (!isConfigured()) {
            return new BackfillResult(false, false, limit, batchSize, 0, 0, 0, 0, 0);
        }
        if (!ensureStorage()) {
            return new BackfillResult(true, false, limit, batchSize, 0, 0, 0, 0, 0);
        }

        int checked = 0;
        int embedded = 0;
        int skipped = 0;
        int failed = 0;
        int batches = 0;
        List<FurnitureItem> batch = new ArrayList<>();

        for (FurnitureItem item : candidateSupplier.get()) {
            if (embedded + failed >= limit) {
                break;
            }

            checked++;

            if (hasCurrentEmbedding(item, contentHash(item))) {
                skipped++;
                continue;
            }

            batch.add(item);

            int remaining = limit - embedded - failed;
            if (batch.size() >= Math.min(batchSize, remaining)) {
                BatchResult result = embedFurnitureBatchSafely(batch);
                embedded += result.embedded();
                failed += result.failed();
                batches += result.batches();
                batch.clear();
            }
        }

        if (!batch.isEmpty() && embedded + failed < limit) {
            BatchResult result = embedFurnitureBatchSafely(batch);
            embedded += result.embedded();
            failed += result.failed();
            batches += result.batches();
        }

        return new BackfillResult(true, true, limit, batchSize, checked, embedded, skipped, failed, batches);
    }

    private boolean isConfigured() {
        return enabled && hasText(apiKey);
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
                    create table if not exists furniture_embeddings (
                        furniture_id uuid primary key references furniture_items(id) on delete cascade,
                        image_embedding vector(%d) not null,
                        text_embedding vector(%d) not null,
                        combined_embedding vector(%d) not null,
                        embedding_model text not null,
                        embedding_dim integer not null,
                        content_hash text not null,
                        image_weight double precision not null,
                        text_weight double precision not null,
                        created_at timestamptz not null default now(),
                        updated_at timestamptz not null default now()
                    )
                    """.formatted(outputDimension, outputDimension, outputDimension));
            storageInitialized = true;
            return true;
        } catch (Exception e) {
            log.warn("Furniture embedding storage is not available: {}", e.getMessage());
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

    private boolean hasCurrentEmbedding(FurnitureItem item, String contentHash) {
        Integer count = jdbcTemplate.queryForObject("""
                        select count(*)
                        from furniture_embeddings
                        where furniture_id = ?
                          and content_hash = ?
                          and embedding_model = ?
                          and embedding_dim = ?
                        """,
                Integer.class,
                item.getId(),
                contentHash,
                model,
                outputDimension);
        return count != null && count > 0;
    }

    private List<double[]> requestEmbeddings(String imageUrl, String text)
            throws IOException, InterruptedException {
        List<Map<String, Object>> inputs = new ArrayList<>();
        if (hasText(imageUrl)) {
            inputs.add(Map.of("content", List.of(
                    Map.of("type", "image_url", "image_url", imageUrl)
            )));
        }
        inputs.add(Map.of("content", List.of(
                Map.of("type", "text", "text", text)
        )));

        return requestEmbeddings(inputs);
    }

    private List<double[]> requestEmbeddings(List<Map<String, Object>> inputs)
            throws IOException, InterruptedException {
        Map<String, Object> payload = Map.of(
                "inputs", inputs,
                "model", model,
                "input_type", "document",
                "truncation", true,
                "output_dimension", outputDimension
        );

        HttpRequest request = HttpRequest.newBuilder(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new VoyageApiException(response.statusCode(), response.body());
        }

        return parseEmbeddings(response.body());
    }

    private BatchResult embedFurnitureBatchSafely(List<FurnitureItem> items) {
        try {
            int embedded = embedFurnitureBatch(items);
            return new BatchResult(embedded, items.size() - embedded, 1);
        } catch (VoyageApiException e) {
            log.warn("Failed to embed furniture batch of {} items: Voyage API returned {}: {}",
                    items.size(), e.statusCode(), e.safeBody());

            if (e.statusCode() == 429 || items.size() == 1) {
                return new BatchResult(0, items.size(), 1);
            }

            int middle = items.size() / 2;
            BatchResult left = embedFurnitureBatchSafely(items.subList(0, middle));
            BatchResult right = embedFurnitureBatchSafely(items.subList(middle, items.size()));
            return new BatchResult(
                    left.embedded() + right.embedded(),
                    left.failed() + right.failed(),
                    1 + left.batches() + right.batches()
            );
        } catch (Exception e) {
            log.warn("Failed to embed furniture batch of {} items: {}", items.size(), e.getMessage());
            return new BatchResult(0, items.size(), 1);
        }
    }

    private int embedFurnitureBatch(List<FurnitureItem> items) throws IOException, InterruptedException {
        if (items.isEmpty()) {
            return 0;
        }

        List<Map<String, Object>> inputs = new ArrayList<>();
        for (FurnitureItem item : items) {
            if (hasText(item.getImageUrl())) {
                inputs.add(Map.of("content", List.of(
                        Map.of("type", "image_url", "image_url", item.getImageUrl())
                )));
            }
            inputs.add(Map.of("content", List.of(
                    Map.of("type", "text", "text", toEmbeddingText(item))
            )));
        }

        List<double[]> embeddings = requestEmbeddings(inputs);
        if (embeddings.size() != inputs.size()) {
            throw new IllegalStateException(
                    "Expected " + inputs.size() + " embeddings, got " + embeddings.size()
            );
        }
        int embeddingIndex = 0;
        int embedded = 0;

        for (FurnitureItem item : items) {
            double[] imageEmbedding;
            double[] textEmbedding;

            if (hasText(item.getImageUrl())) {
                imageEmbedding = embeddings.get(embeddingIndex++);
                textEmbedding = embeddings.get(embeddingIndex++);
            } else {
                textEmbedding = embeddings.get(embeddingIndex++);
                imageEmbedding = textEmbedding;
            }

            double[] combinedEmbedding = combine(imageEmbedding, textEmbedding);
            upsertEmbedding(item, imageEmbedding, textEmbedding, combinedEmbedding, contentHash(item));
            embedded++;
        }

        return embedded;
    }

    private List<double[]> parseEmbeddings(String body) throws IOException {
        JsonNode root = objectMapper.readTree(body);

        JsonNode embeddings = root.get("embeddings");
        if (embeddings != null && embeddings.isArray()) {
            return parseEmbeddingArray(embeddings);
        }

        JsonNode data = root.get("data");
        if (data != null && data.isArray()) {
            List<double[]> vectors = new ArrayList<>();
            for (JsonNode item : data) {
                JsonNode embedding = item.get("embedding");
                if (embedding != null && embedding.isArray()) {
                    vectors.add(toVector(embedding));
                }
            }
            if (!vectors.isEmpty()) {
                return vectors;
            }
        }

        throw new IllegalStateException("Voyage API response did not contain embeddings");
    }

    private List<double[]> parseEmbeddingArray(JsonNode embeddings) {
        List<double[]> vectors = new ArrayList<>();
        for (JsonNode embedding : embeddings) {
            vectors.add(toVector(embedding));
        }
        return vectors;
    }

    private double[] toVector(JsonNode embedding) {
        if (embedding.size() != outputDimension) {
            throw new IllegalStateException(
                    "Expected " + outputDimension + " embedding values, got " + embedding.size()
            );
        }

        double[] vector = new double[embedding.size()];
        for (int i = 0; i < embedding.size(); i++) {
            vector[i] = embedding.get(i).asDouble();
        }
        return vector;
    }

    private double[] combine(double[] imageEmbedding, double[] textEmbedding) {
        double[] image = normalize(imageEmbedding);
        double[] text = normalize(textEmbedding);
        double totalWeight = imageWeight + textWeight;
        double normalizedImageWeight = totalWeight <= 0 ? 0.7 : imageWeight / totalWeight;
        double normalizedTextWeight = totalWeight <= 0 ? 0.3 : textWeight / totalWeight;

        double[] combined = new double[outputDimension];
        for (int i = 0; i < outputDimension; i++) {
            combined[i] = normalizedImageWeight * image[i] + normalizedTextWeight * text[i];
        }
        return normalize(combined);
    }

    private double[] normalize(double[] vector) {
        double norm = 0;
        for (double value : vector) {
            norm += value * value;
        }
        norm = Math.sqrt(norm);
        if (norm == 0) {
            return vector.clone();
        }

        double[] normalized = new double[vector.length];
        for (int i = 0; i < vector.length; i++) {
            normalized[i] = vector[i] / norm;
        }
        return normalized;
    }

    private void upsertEmbedding(
            FurnitureItem item,
            double[] imageEmbedding,
            double[] textEmbedding,
            double[] combinedEmbedding,
            String contentHash
    ) {
        jdbcTemplate.update("""
                        insert into furniture_embeddings (
                            furniture_id,
                            image_embedding,
                            text_embedding,
                            combined_embedding,
                            embedding_model,
                            embedding_dim,
                            content_hash,
                            image_weight,
                            text_weight
                        )
                        values (?, ?::vector, ?::vector, ?::vector, ?, ?, ?, ?, ?)
                        on conflict (furniture_id) do update set
                            image_embedding = excluded.image_embedding,
                            text_embedding = excluded.text_embedding,
                            combined_embedding = excluded.combined_embedding,
                            embedding_model = excluded.embedding_model,
                            embedding_dim = excluded.embedding_dim,
                            content_hash = excluded.content_hash,
                            image_weight = excluded.image_weight,
                            text_weight = excluded.text_weight,
                            updated_at = now()
                        """,
                item.getId(),
                toVectorLiteral(imageEmbedding),
                toVectorLiteral(textEmbedding),
                toVectorLiteral(combinedEmbedding),
                model,
                outputDimension,
                contentHash,
                imageWeight,
                textWeight);
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

    private String toEmbeddingText(FurnitureItem item) {
        StringBuilder sb = new StringBuilder();
        appendField(sb, "title", item.getTitle());
        appendField(sb, "category", item.getCategory());
        appendField(sb, "brand", item.getBrand());
        appendField(sb, "style", item.getStyle());
        appendField(sb, "color", item.getColor());
        appendField(sb, "room", item.getRoomType());
        if (item.getPrice() != null) {
            appendField(sb, "price_usd", item.getPrice().toString());
        }
        return sb.toString().trim();
    }

    private void appendField(StringBuilder sb, String label, String value) {
        if (!hasText(value)) {
            return;
        }
        if (!sb.isEmpty()) {
            sb.append('\n');
        }
        sb.append(label).append(": ").append(value.trim());
    }

    private String contentHash(FurnitureItem item) {
        String content = String.join("|",
                cleanForHash(item.getTitle()),
                cleanForHash(item.getCategory()),
                cleanForHash(item.getBrand()),
                cleanForHash(item.getStyle()),
                cleanForHash(item.getColor()),
                item.getPrice() == null ? "" : item.getPrice().toString(),
                cleanForHash(item.getRoomType()),
                cleanForHash(item.getProductUrl()),
                cleanForHash(item.getImageUrl()),
                model,
                String.valueOf(outputDimension),
                String.valueOf(imageWeight),
                String.valueOf(textWeight)
        );

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(content.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private String cleanForHash(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private record BatchResult(int embedded, int failed, int batches) {}

    private static class VoyageApiException extends RuntimeException {
        private final int statusCode;
        private final String body;

        private VoyageApiException(int statusCode, String body) {
            super("Voyage API returned " + statusCode);
            this.statusCode = statusCode;
            this.body = body == null ? "" : body;
        }

        private int statusCode() {
            return statusCode;
        }

        private String safeBody() {
            if (body.length() <= 500) {
                return body;
            }
            return body.substring(0, 500) + "...";
        }
    }
}
