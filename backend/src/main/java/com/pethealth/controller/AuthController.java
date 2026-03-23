package com.pethealth.controller;

import com.pethealth.entity.User;
import com.pethealth.service.UserService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend to access
@Slf4j
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        log.info("Received register request for email: {}", request.getEmail());
        try {
            User user = userService.register(request.getEmail(), request.getPassword(), request.getNickname());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Register error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("Received login request for email: {}", request.getEmail());
        try {
            User user = userService.login(request.getEmail(), request.getPassword());
            Map<String, Object> response = new HashMap<>();
            response.put("token", "fake-jwt-token-" + user.getId()); // In production, generate real JWT
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login error for email {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @Data
    static class RegisterRequest {
        private String email;
        private String password;
        private String nickname;
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }
}
