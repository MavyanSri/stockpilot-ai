package com.vcube.stockpilot.controller;

import com.vcube.stockpilot.service.InventoryService;
import com.vcube.stockpilot.model.PurchaseOrder;
import com.vcube.stockpilot.dto.PurchaseOrderRequest;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PurchaseOrderController {
    private final InventoryService inventoryService;

    public PurchaseOrderController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/purchase-orders")
    public List<PurchaseOrder> orders() {
        return inventoryService.orders();
    }

    @GetMapping("/purchase-orders/{id}")
    public PurchaseOrder order(@PathVariable Long id) {
        return inventoryService.order(id);
    }

    @PostMapping("/purchase-orders")
    public PurchaseOrder place(@Valid @RequestBody PurchaseOrderRequest req,Authentication auth) {
        return inventoryService.place(req, auth);
    }

    @PostMapping("/purchase-orders/{id}/receive")
    public PurchaseOrder receive(@PathVariable Long id,Authentication auth) {
        return inventoryService.receive(id, auth);
    }
}
