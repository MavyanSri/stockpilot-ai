package com.vcube.stockpilot.controller;

import com.vcube.stockpilot.service.AnalyticsService;
import com.vcube.stockpilot.dto.Sales;
import java.util.*;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SalesReportController {
    private final AnalyticsService analyticsService;

    public SalesReportController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/reports/sales")
    public Sales sales(@RequestParam LocalDate from,@RequestParam LocalDate to) {
        return analyticsService.sales(from, to);
    }
}
