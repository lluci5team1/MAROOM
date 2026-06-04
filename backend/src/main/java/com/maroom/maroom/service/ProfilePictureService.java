package com.maroom.maroom.service;

import com.maroom.maroom.domain.User;
import com.maroom.maroom.domain.UserProfilePicture;
import com.maroom.maroom.repository.UserProfilePictureRepository;
import com.maroom.maroom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfilePictureService {

    private static final long MAX_BYTES = 2 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final UserRepository userRepository;
    private final UserProfilePictureRepository pictureRepository;
    private final String publicBaseUrl;

    public ProfilePictureService(
            UserRepository userRepository,
            UserProfilePictureRepository pictureRepository,
            @Value("${maroom.public-base-url:}") String publicBaseUrl
    ) {
        this.userRepository = userRepository;
        this.pictureRepository = pictureRepository;
        this.publicBaseUrl = publicBaseUrl == null ? "" : publicBaseUrl.trim();
    }

    public record UploadResult(String profilePictureUrl) {}

    public UploadResult upload(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 2MB or smaller");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, or WebP images are allowed");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read uploaded image");
        }

        UserProfilePicture picture = pictureRepository.findById(userId)
                .orElseGet(() -> new UserProfilePicture(userId, bytes, contentType));
        picture.setData(bytes);
        picture.setContentType(contentType);
        pictureRepository.save(picture);

        String url = buildPublicUrl(userId, picture.getUpdatedAt().toEpochMilli());
        user.setProfilePictureUrl(url);
        userRepository.save(user);

        return new UploadResult(url);
    }

    public Optional<UserProfilePicture> findPicture(UUID userId) {
        return pictureRepository.findById(userId);
    }

    public void delete(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        pictureRepository.deleteById(userId);
        user.setProfilePictureUrl(null);
        userRepository.save(user);
    }

    public String buildPublicUrl(UUID userId, long version) {
        String base = publicBaseUrl.isBlank()
                ? "http://localhost:8080"
                : publicBaseUrl.replaceAll("/+$", "");
        return base + "/users/" + userId + "/profile-picture/file?v=" + version;
    }

    public static String safeProfilePictureUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("data:")) {
            return null;
        }
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        return null;
    }
}
