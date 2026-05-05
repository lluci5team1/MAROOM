package com.maroom.maroom.repository;

import com.maroom.maroom.domain.FurnitureItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface FurnitureItemRepository
        extends JpaRepository<FurnitureItem, UUID>, JpaSpecificationExecutor<FurnitureItem> {

    Optional<FurnitureItem> findByProductUrl(String productUrl);

    boolean existsByProductUrl(String productUrl);
}