package com.maroom.maroom.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maroom.maroom.domain.FurnitureItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class SerpApiService {

    private static final Logger log = LoggerFactory.getLogger(SerpApiService.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${serpapi.api-key}")
    private String apiKey;

    @Value("${serpapi.base-url}")
    private String baseUrl;

    public List<FurnitureItem> searchFurniture(
            String query,
            String category,
            String style,
            String color,
            String roomType
    ) {
        if (!hasText(apiKey)) {
            throw new IllegalStateException("SerpApi key is not configured");
        }

        URI uri = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("engine", "google_shopping")
                .queryParam("q", query)
                .queryParam("api_key", apiKey)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        log.info("Searching SerpApi Google Shopping for query: {}", query);

        String json = restTemplate.getForObject(uri, String.class);

        JsonNode response;
        try {
            response = objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse SerpApi response", e);
        }

        List<FurnitureItem> items = new ArrayList<>();

        if (response != null && response.has("shopping_results")) {
            for (JsonNode result : response.get("shopping_results")) {
                FurnitureItem item = new FurnitureItem();

                item.setTitle(result.path("title").asText(null));
                item.setBrand(firstText(result, "source", "seller", "merchant"));

                item.setProductUrl(firstText(result, "product_link", "link"));

                item.setImageUrl(firstText(result, "thumbnail", "serpapi_thumbnail"));

                if (result.has("extracted_price")) {
                    item.setPrice((int) Math.round(result.path("extracted_price").asDouble()));
                } else {
                    item.setPrice(parsePrice(result.path("price").asText(null)));
                }

                item.setCategory(category);
                item.setStyle(style);
                item.setColor(color);
                item.setRoomType(roomType);

                if (item.getTitle() != null &&
                        item.getProductUrl() != null &&
                        item.getImageUrl() != null) {
                    items.add(item);
                }
            }
        }

        return items;
    }

    private String firstText(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            String value = node.path(fieldName).asText(null);
            if (hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private Integer parsePrice(String value) {
        if (!hasText(value)) {
            return null;
        }

        String cleaned = value.replaceAll("[^0-9.]", "");
        if (cleaned.isBlank()) {
            return null;
        }

        try {
            return (int) Math.round(Double.parseDouble(cleaned));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
