package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record OrderLineRequest(@NotNull @Positive Long productId,@NotNull @Min(1) @Max(1000000) Integer quantity,@NotNull @PositiveOrZero @Digits(integer=12,fraction=2) BigDecimal unitCost) {}
