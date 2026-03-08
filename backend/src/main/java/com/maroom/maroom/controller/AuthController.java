package com.maroom.maroom.controller;

import com.maroom.maroom.dto.AuthResult;
import com.maroom.maroom.dto.LoginRequest;
import com.maroom.maroom.dto.SignupRequest;
import com.maroom.maroom.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public AuthResult signup(@RequestBody SignupRequest request) {
        return authService.signup(
                request.getEmail(),
                request.getPassword(),
                request.getDisplayName()
        );
    }

    @PostMapping("/login")
    public AuthResult login(@RequestBody LoginRequest request) {
        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }
}