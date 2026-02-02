package com.maroom.maroom.repository;

import com.maroom.maroom.domain.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavedItemRepository extends JpaRepository<SavedItem, UUID> {
    List<SavedItem> findBySavedListId(UUID savedListId);
}
