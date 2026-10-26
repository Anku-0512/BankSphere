
package com.banking.bankingapi;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
	    "http://localhost:5173",
	    "http://localhost:5174",
	    "http://localhost:5175",
	    "http://localhost:5176",
	    "http://localhost:5177"
	})
public class AuthController {

    private final JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> data) {

        String email = data.get("email");
        String password = data.get("password");

        if (email == null || email.isBlank()
                || password == null || password.length() < 8) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email is required and password must have at least 8 characters."
                    ));
        }

        try {
            String normalizedEmail = email.trim().toLowerCase();
            String passwordHash = passwordEncoder.encode(password);

            jdbcTemplate.update(
                    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                    normalizedEmail,
                    passwordHash
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message",
                            "Registration successful. You can now log in."
                    ));

        } catch (org.springframework.dao.DuplicateKeyException ex) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This email is already registered."
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> data) {

        String email = data.get("email");
        String password = data.get("password");

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email and password are required."
                    ));
        }

        String normalizedEmail = email.trim().toLowerCase();

        var users = jdbcTemplate.query(
                "SELECT password_hash FROM users WHERE email = ?",
                (rs, rowNum) -> rs.getString("password_hash"),
                normalizedEmail
        );

        if (users.isEmpty()
                || !passwordEncoder.matches(password, users.get(0))) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid email or password."
                    ));
        }

        return ResponseEntity.ok(
                Map.of("message", "Login successful.")
        );
    }
}
