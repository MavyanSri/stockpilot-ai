package com.vcube.stockpilot.dto;

import java.math.BigDecimal;

public record SalesRow(Long productId,String name,long units,BigDecimal revenue) {}
