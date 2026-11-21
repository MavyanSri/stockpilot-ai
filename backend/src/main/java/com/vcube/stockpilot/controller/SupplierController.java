package com.vcube.stockpilot.controller;

import com.vcube.stockpilot.service.InventoryService;
import com.vcube.stockpilot.model.Supplier;
import com.vcube.stockpilot.dto.SupplierRequest;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SupplierController {
    private final InventoryService inventoryService;

    public SupplierController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/suppliers")
    public List<Supplier> suppliers() {
        return inventoryService.suppliers();
    }

    @PostMapping("/suppliers")
    public Supplier addSupplier(@Valid @RequestBody SupplierRequest data) {
        return inventoryService.addSupplier(data);
    }

    @PutMapping("/suppliers/{id}")
    public Supplier editSupplier(@PathVariable Long id,@Valid @RequestBody SupplierRequest data) {
        return inventoryService.editSupplier(id, data);
    }
}
