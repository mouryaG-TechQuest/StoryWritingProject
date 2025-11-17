package com.storyapp.user.controller;

import com.storyapp.user.dto.LoginRequest;
import com.storyapp.user.dto.RegisterRequest;
import com.storyapp.user.model.User;
import com.storyapp.user.repository.UserRepository;
import com.storyapp.user.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            String username = request.getUsername();
            String password = request.getPassword();
            
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }
            
            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
            }
            
            User user = new User(username, passwordEncoder.encode(password));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        String token = tokenProvider.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token, "username", username));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromJWT(token);
            return ResponseEntity.ok(Map.of("valid", true, "username", username));
        }
        return ResponseEntity.ok(Map.of("valid", false));
    }
}
