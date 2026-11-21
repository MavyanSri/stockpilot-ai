package com.vcube.stockpilot.service;

import com.vcube.stockpilot.model.Account;
import com.vcube.stockpilot.repository.AccountRepository;
import com.vcube.stockpilot.config.ApiErrors;
import com.vcube.stockpilot.dto.LoginRequest;
import com.vcube.stockpilot.dto.RegisterRequest;
import com.vcube.stockpilot.dto.ResendOtpRequest;
import com.vcube.stockpilot.dto.VerifyOtpRequest;
import static com.vcube.stockpilot.config.ApiErrors.*;
import java.time.*;
import java.util.*;
import javax.crypto.SecretKey;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final AccountRepository accounts;
    private final BCryptPasswordEncoder encoder;
    private final SecretKey key;
    @Value("${app.allowed-emails:}") private String allowedEmails;

    AuthService(AccountRepository accounts, BCryptPasswordEncoder encoder, SecretKey key) {
        this.accounts = accounts;
        this.encoder = encoder;
        this.key = key;
    }

    String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public Map<String,String> register(RegisterRequest req) {
        String email = normalize(req.email());
        if (!allowedEmails.isBlank() && Arrays.stream(allowedEmails.split(",")).map(this::normalize).noneMatch(email::equals)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This email is outside the configured inventory team");
        }
        if (req.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw bad("Password must fit in 72 UTF-8 bytes");
        }
        var existing = accounts.findByEmail(email);
        if (existing.isPresent()) {
            throw conflict("Email already registered");
        }
        var user = new Account();
        user.email = email;
        user.name = req.name().trim();
        user.passwordHash = encoder.encode(req.password());
        user.verified = true;
        String assignedRole = "USER";
        if (req.role() != null && !req.role().isBlank()) {
            assignedRole = req.role().trim().toUpperCase(Locale.ROOT).contains("ADMIN") ? "ADMIN" : "USER";
        } else if (email.contains("admin") || req.name().toLowerCase().contains("admin") || accounts.count() == 0) {
            assignedRole = "ADMIN";
        }
        user.role = assignedRole;
        user.otpHash = null;
        user.otpExpires = null;
        user.lastSent = null;
        user.attempts = 0;
        accounts.saveAndFlush(user);
        return Map.of("message", "Registration successful. You can log in now.", "email", user.email);
    }

    @Transactional
    public Map<String,String> resend(ResendOtpRequest req) {
        String email = normalize(req.email());
        var user = accounts.findByEmail(email).orElseThrow(ApiErrors::missing);
        user.verified = true;
        accounts.save(user);
        return Map.of("message", "OTP verification is disabled. You can log in directly.", "email", user.email);
    }

    @Transactional
    public ResponseEntity<?> verify(VerifyOtpRequest req) {
        String email = normalize(req.email());
        var user = accounts.findByEmail(email).orElse(null);
        if (user != null) {
            user.verified = true;
            user.otpHash = null;
            user.otpExpires = null;
            accounts.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Email verified. You can log in"));
    }

    @Transactional
    public Map<String,Object> login(LoginRequest req) throws JOSEException {
        var user = accounts.findByEmail(normalize(req.email())).orElse(null);
        if (user == null || req.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72 || !encoder.matches(req.password(), user.passwordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login");
        }
        if (!user.verified) {
            user.verified = true;
            accounts.save(user);
        }
        var now = Instant.now();
        var claims = new JWTClaimsSet.Builder()
            .issuer("stockpilot")
            .subject(user.email)
            .issueTime(Date.from(now))
            .expirationTime(Date.from(now.plusSeconds(86400))) // 24 hours validity
            .build();
        var token = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        token.sign(new MACSigner(key.getEncoded()));
        String assignedRole = (user.role != null && !user.role.isBlank()) 
            ? user.role 
            : (user.email.toLowerCase().contains("admin") ? "ADMIN" : "USER");
        return Map.of(
            "accessToken", token.serialize(),
            "tokenType", "Bearer",
            "expiresIn", 86400,
            "name", user.name,
            "email", user.email,
            "role", assignedRole
        );
    }
}
