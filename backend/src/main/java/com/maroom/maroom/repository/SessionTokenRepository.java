package com.maroom.maroom.repository;

import com.maroom.maroom.domain.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SessionTokenRepository extends JpaRepository<SessionToken, UUID> {
    Optional<SessionToken> findByToken(String token);

    void deleteByToken(String token);
}