package com.maroom.maroom.repository;

import com.maroom.maroom.domain.SwipeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SwipeEventRepository extends JpaRepository<SwipeEvent, UUID> {

    List<SwipeEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndFurnitureId(UUID userId, UUID furnitureId);

    Optional<SwipeEvent> findFirstByUserIdAndFurnitureIdOrderByCreatedAtDesc(UUID userId, UUID furnitureId);

    @Query("select s.furnitureId from SwipeEvent s where s.userId = :userId")
    List<UUID> findFurnitureIdsByUserId(UUID userId);
}