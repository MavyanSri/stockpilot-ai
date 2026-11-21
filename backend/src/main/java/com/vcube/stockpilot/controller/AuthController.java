package com.vcube.stockpilot.controller;

import com.vcube.stockpilot.service.AuthService;
import com.vcube.stockpilot.dto.LoginRequest;
import com.vcube.stockpilot.dto.RegisterRequest;
import com.vcube.stockpilot.dto.ResendOtpRequest;
import com.vcube.stockpilot.dto.VerifyOtpRequest;
import java.util.*;
import org.springframework.http.ResponseEntity;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Map<String,String> register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/resend-otp")
    public Map<String,String> resend(@Valid @RequestBody ResendOtpRequest req) {
        return authService.resend(req);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyOtpRequest req) {
        return authService.verify(req);
    }

    @PostMapping("/login")
    public Map<String,Object> login(@Valid @RequestBody LoginRequest req) throws JOSEException {
        return authService.login(req);
    }
}
