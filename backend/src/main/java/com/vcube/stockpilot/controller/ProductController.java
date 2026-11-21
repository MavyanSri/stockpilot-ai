package com.vcube.stockpilot.controller;

import com.vcube.stockpilot.service.InventoryService;
import com.vcube.stockpilot.model.Product;
import com.vcube.stockpilot.dto.ProductRequest;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductController {
    private final InventoryService inventoryService;

    public ProductController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/products")
    public List<Product> products() {
        return inventoryService.products();
    }

    @PostMapping("/products")
    public Product addProduct(@Valid @RequestBody ProductRequest data) {
        return inventoryService.addProduct(data);
    }

    @PutMapping("/products/{id}")
    public Product editProduct(@PathVariable Long id,@Valid @RequestBody ProductRequest data) {
        return inventoryService.editProduct(id, data);
    }
}
