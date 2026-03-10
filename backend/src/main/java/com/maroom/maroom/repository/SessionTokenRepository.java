package com.maroom.maroom.repository;

import com.maroom.maroom.domain.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SessionTokenRepository extends JpaRepository<SessionToken, UUID> {
}