package com.maroom.maroom.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.maroom.maroom.domain.SessionToken;
import com.maroom.maroom.domain.User;
import com.maroom.maroom.dto.AuthResult;
import com.maroom.maroom.repository.PreferenceRepository;
import com.maroom.maroom.repository.SessionTokenRepository;
import com.maroom.maroom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SessionTokenRepository sessionTokenRepository;
    private final PreferenceRepository preferenceRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
                       SessionTokenRepository sessionTokenRepository,
                       PreferenceRepository preferenceRepository) {
        this.userRepository = userRepository;
        this.sessionTokenRepository = sessionTokenRepository;
        this.preferenceRepository = preferenceRepository;
    }

    public AuthResult signup(String email, String password, String displayName) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        String passwordHash = encoder.encode(password);

        User user = new User(email, displayName, "EMAIL", passwordHash);
        User savedUser = userRepository.save(user);

        String token = generateToken();

        SessionToken sessionToken = new SessionToken();
        sessionToken.setToken(token);
        sessionToken.setUserId(savedUser.getId());
        sessionTokenRepository.save(sessionToken);

        return new AuthResult(token, savedUser.getId(), false);
    }

    public AuthResult login(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = optionalUser.get();

        if (!encoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = generateToken();

        SessionToken sessionToken = new SessionToken();
        sessionToken.setToken(token);
        sessionToken.setUserId(user.getId());
        sessionTokenRepository.save(sessionToken);

        boolean hasCompletedOnboarding = preferenceRepository.existsById(user.getId());

        return new AuthResult(token, user.getId(), hasCompletedOnboarding);
    }

    public AuthResult googleLogin(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Google idToken is required");
        }

        GoogleIdToken.Payload payload = verifyGoogleIdToken(idToken);

        String email = payload.getEmail();
        Boolean emailVerified = payload.getEmailVerified();
        String displayName = (String) payload.get("name");

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email is missing");
        }

        if (emailVerified == null || !emailVerified) {
            throw new IllegalArgumentException("Google email is not verified");
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    String name = displayName != null && !displayName.isBlank()
                            ? displayName
                            : email;

                    User newUser = new User(
                            email,
                            name,
                            "GOOGLE",
                            "GOOGLE_AUTH"
                    );

                    return userRepository.save(newUser);
                });

        String token = generateToken();

        SessionToken sessionToken = new SessionToken();
        sessionToken.setToken(token);
        sessionToken.setUserId(user.getId());
        sessionTokenRepository.save(sessionToken);

        boolean hasCompletedOnboarding = preferenceRepository.existsById(user.getId());

        return new AuthResult(token, user.getId(), hasCompletedOnboarding);
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                throw new IllegalArgumentException("Invalid Google idToken");
            }

            return googleIdToken.getPayload();

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Google idToken");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
    public void logout(String token) {
        sessionTokenRepository.deleteByToken(token);
    }
}