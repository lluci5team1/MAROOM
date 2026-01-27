package com.maroom.maroom.controller;

import com.maroom.maroom.domain.User;
import com.maroom.maroom.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public User create(@RequestBody CreateUserRequest req) {
        if (req.email() == null || req.email().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email required");

        if (userRepository.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already exists");

        return userRepository.save(
                new User(
                        req.email().trim(),
                        req.displayName().trim(),
                        req.authProvider() == null ? "LOCAL" : req.authProvider().trim()
                )
        );
    }

    @GetMapping
    public List<User> list() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User get(@PathVariable UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}

record CreateUserRequest(String email, String displayName, String authProvider) {}