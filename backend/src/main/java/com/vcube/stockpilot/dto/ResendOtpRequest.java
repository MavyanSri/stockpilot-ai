package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record ResendOtpRequest(@Email @NotBlank String email) {}
