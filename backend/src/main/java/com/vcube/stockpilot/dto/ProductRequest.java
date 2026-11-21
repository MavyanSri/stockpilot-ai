package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(@NotBlank @Size(max=64) String sku,@NotBlank @Size(max=120) String name,@NotNull @Positive Long supplierId,@NotNull @PositiveOrZero Integer minStock,@NotNull @PositiveOrZero @Digits(integer=12,fraction=2) BigDecimal sellingPrice) {}
