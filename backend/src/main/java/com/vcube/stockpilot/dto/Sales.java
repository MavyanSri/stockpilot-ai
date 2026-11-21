package com.vcube.stockpilot.dto;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

public record Sales(LocalDate from,LocalDate to,long unitsSold,BigDecimal revenue,List<SalesRow> products) {}
