package com.maroom.maroom.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.maroom.maroom.domain.SwipeEvent;

public interface SwipeEventRepository extends JpaRepository<SwipeEvent, UUID> {
    List<SwipeEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
}