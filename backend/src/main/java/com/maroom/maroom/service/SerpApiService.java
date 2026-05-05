package com.maroom.maroom.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maroom.maroom.domain.FurnitureItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class SerpApiService {

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
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);

        String url = baseUrl
                + "?engine=google_shopping"
                + "&q=" + encodedQuery
                + "&api_key=" + apiKey;

        System.out.println("QUERY: " + query);
        System.out.println("URL: " + url);

        String json = restTemplate.getForObject(url, String.class);

        System.out.println("RAW JSON: " + json);

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
                item.setBrand(result.path("source").asText(null));

                String productUrl = result.path("product_link").asText(null);
                if (productUrl == null) {
                    productUrl = result.path("link").asText(null);
                }
                item.setProductUrl(productUrl);

                item.setImageUrl(result.path("thumbnail").asText(null));

                if (result.has("extracted_price")) {
                    item.setPrice((int) Math.round(result.path("extracted_price").asDouble()));
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
}