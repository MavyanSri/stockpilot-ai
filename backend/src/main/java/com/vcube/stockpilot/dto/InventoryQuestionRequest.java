package com.vcube.stockpilot.dto;

import jakarta.validation.constraints.*;

public record InventoryQuestionRequest(@NotBlank @Size(max=500) String question) {}
