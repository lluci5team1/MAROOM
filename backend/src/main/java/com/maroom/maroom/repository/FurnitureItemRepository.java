package com.maroom.maroom.repository;

import com.maroom.maroom.domain.FurnitureItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FurnitureItemRepository
        extends JpaRepository<FurnitureItem, UUID> {
}