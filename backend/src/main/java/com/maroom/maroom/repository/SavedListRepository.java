package com.maroom.maroom.repository;

import com.maroom.maroom.domain.SavedList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedListRepository extends JpaRepository<SavedList, UUID> {
    List<SavedList> findByUserId(UUID userId);
    Optional<SavedList> findFirstByUserIdAndName(UUID userId, String name);
}
