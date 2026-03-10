package com.maroom.maroom.dto;

import java.time.Instant;
import java.util.UUID;

public record SavedFurnitureResponse(
        UUID savedItemId,
        Instant savedAt,
        UUID furnitureId,
        String title,
        String category,
        String brand,
        String style,
        String color,
        Integer price,
        String roomType,
        String productUrl,
        String imageUrl
) {
}