package com.maroom.maroom.dto;

import java.math.BigDecimal;
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
        BigDecimal price,
        String roomType,
        String productUrl,
        String imageUrl
) {
}
