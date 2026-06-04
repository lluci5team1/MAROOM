package com.maroom.maroom.repository;

import com.maroom.maroom.domain.UserProfilePicture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserProfilePictureRepository extends JpaRepository<UserProfilePicture, UUID> {}
