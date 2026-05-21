package com.maroom.maroom.repository;

import com.maroom.maroom.domain.FurnitureItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FurnitureItemRepository
        extends JpaRepository<FurnitureItem, UUID>, JpaSpecificationExecutor<FurnitureItem> {

    Optional<FurnitureItem> findByProductUrl(String productUrl);

    boolean existsByProductUrl(String productUrl);

    @Query(value = """
            select *
            from furniture_items
            order by id
            limit :limit
            offset :offset
            """, nativeQuery = true)
    List<FurnitureItem> findWindowById(@Param("offset") int offset, @Param("limit") int limit);
}
