package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank @Size(max=100) String name,
    @NotBlank @Email @Size(max=254) String email,
    @NotBlank @Size(min=8,max=64) String password,
    String role
) {}

