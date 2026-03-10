package com.maroom.maroom.repository;

import com.maroom.maroom.domain.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PreferenceRepository extends JpaRepository<Preference, UUID> {
}