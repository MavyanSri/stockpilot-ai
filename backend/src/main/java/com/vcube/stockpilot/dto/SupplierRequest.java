package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record SupplierRequest(@NotBlank @Size(max=100) String name,@Size(max=32) String phone,@NotNull @Min(1) @Max(365) Integer leadTimeDays) {}
