package com.maroom.maroom.controller;

import com.maroom.maroom.domain.User;
import com.maroom.maroom.repository.UserRepository;
import com.maroom.maroom.service.ProfilePictureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public record CreateUserRequest(String email, String displayName, String authProvider) {}
    public record UpdateUserRequest(String displayName, String phoneNumber) {}
    public record UserResponse(String id, String email, String displayName, String phoneNumber, String profilePictureUrl) {}

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhoneNumber(),
                ProfilePictureService.safeProfilePictureUrl(user.getProfilePictureUrl())
        );
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        if (req == null) return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));

        String email = req.email() == null ? null : req.email().trim();
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists"));
        }

        String displayName = req.displayName() == null ? null : req.displayName().trim();
        if (displayName == null || displayName.isBlank()) {
            displayName = email;
        }

        String authProvider = req.authProvider() == null ? "LOCAL" : req.authProvider().trim();
        if (authProvider.isBlank()) authProvider = "LOCAL";

        User user = new User(email, displayName, authProvider, "");
        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toResponse(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody UpdateUserRequest req) {
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(user -> {
                    if (req.displayName() != null && !req.displayName().isBlank()) {
                        user.setDisplayName(req.displayName().trim());
                    }
                    if (req.phoneNumber() != null) {
                        String phone = req.phoneNumber().trim();
                        user.setPhoneNumber(phone.isEmpty() ? null : phone);
                    }
                    return ResponseEntity.ok(toResponse(userRepository.save(user)));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }
}