package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record StockMovementRequest(@NotNull @Positive Long productId,@NotBlank String type,@NotBlank String reason,@NotNull @Min(1) @Max(1000000) Integer quantity) {}
