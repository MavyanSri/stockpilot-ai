package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(@Email @NotBlank String email,@NotBlank @Size(max=64) String password) {}
