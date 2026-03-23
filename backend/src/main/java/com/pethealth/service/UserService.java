package com.pethealth.service;

import com.pethealth.entity.User;
import com.pethealth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User register(String email, String password, String nickname) {
        log.info("Attempting to register user with email: {}", email);
        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("Registration failed: Email {} already exists", email);
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(password); // In production, use BCrypt
        user.setNickname(nickname);
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: id={}, email={}", savedUser.getId(), savedUser.getEmail());
        return savedUser;
    }

    public User login(String email, String password) {
        log.info("Attempting login for user: {}", email);
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            if (user.get().getPassword().equals(password)) {
                log.info("Login successful for user: {}", email);
                return user.get();
            } else {
                log.warn("Login failed for user: {} - Incorrect password", email);
            }
        } else {
            log.warn("Login failed for user: {} - User not found", email);
        }
        throw new RuntimeException("Invalid credentials");
    }
}
