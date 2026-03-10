package com.maroom.maroom.repository;

import com.maroom.maroom.domain.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedItemRepository extends JpaRepository<SavedItem, UUID> {
    List<SavedItem> findBySavedListId(UUID savedListId);

    List<SavedItem> findBySavedListIdOrderByCreatedAtDesc(UUID savedListId);

    boolean existsBySavedListIdAndFurnitureId(UUID savedListId, UUID furnitureId);

    Optional<SavedItem> findFirstBySavedListIdAndFurnitureId(UUID savedListId, UUID furnitureId);
}