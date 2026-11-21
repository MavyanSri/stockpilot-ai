package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record VerifyOtpRequest(@Email @NotBlank String email,@NotNull @Pattern(regexp="[0-9]{6}") String otp) {}
