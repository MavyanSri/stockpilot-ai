package com.vcube.stockpilot.controller;

import com.vcube.stockpilot.service.InventoryService;
import com.vcube.stockpilot.model.StockMovement;
import com.vcube.stockpilot.dto.StockMovementRequest;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StockMovementController {
    private final InventoryService inventoryService;

    public StockMovementController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/stock-transactions")
    public List<StockMovement> history(@RequestParam(required=false) Long productId) {
        return inventoryService.history(productId);
    }

    @PostMapping("/stock-transactions")
    public Map<String,Object> record(@Valid @RequestBody StockMovementRequest req,Authentication auth) {
        return inventoryService.record(req, auth);
    }
}
