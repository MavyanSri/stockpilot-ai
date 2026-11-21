package com.vcube.stockpilot.features;

import com.vcube.stockpilot.service.AnalyticsService;
import com.vcube.stockpilot.dto.Forecast;
import com.vcube.stockpilot.dto.InventoryQuestionRequest;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class InventoryAiController {
    private final AnalyticsService analyticsService;

    public InventoryAiController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/ai/forecast")
    public Forecast forecast(@RequestParam long productId,@RequestParam(defaultValue="7") int days) {
        return analyticsService.forecast(productId, days);
    }

    @GetMapping("/ai/stock-insights")
    public Map<String,Object> insights(@RequestParam long productId) {
        return analyticsService.insights(productId);
    }

    @GetMapping("/ai/purchase-recommendations")
    public Map<String,Object> recommendations() {
        return analyticsService.recommendations();
    }

    @PostMapping("/ai/ask")
    public Map<String,Object> ask(@Valid @RequestBody InventoryQuestionRequest req) {
        return analyticsService.ask(req);
    }
}
