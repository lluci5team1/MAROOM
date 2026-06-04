package com.maroom.maroom.controller;

import com.maroom.maroom.domain.UserProfilePicture;
import com.maroom.maroom.service.ProfilePictureService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/users/{userId}/profile-picture")
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;

    public ProfilePictureController(ProfilePictureService profilePictureService) {
        this.profilePictureService = profilePictureService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @PathVariable UUID userId,
            @RequestParam("file") MultipartFile file
    ) {
        ProfilePictureService.UploadResult result = profilePictureService.upload(userId, file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/file")
    public ResponseEntity<byte[]> getFile(@PathVariable UUID userId) {
        UserProfilePicture picture = profilePictureService.findPicture(userId)
                .orElse(null);
        if (picture == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .contentType(MediaType.parseMediaType(picture.getContentType()))
                .body(picture.getData());
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@PathVariable UUID userId) {
        profilePictureService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
