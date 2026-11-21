package com.vcube.stockpilot.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderRequest(@NotNull @Positive Long supplierId,@FutureOrPresent LocalDate expectedAt,@NotEmpty @Size(max=100) List<@NotNull @Valid OrderLineRequest> items) {}
