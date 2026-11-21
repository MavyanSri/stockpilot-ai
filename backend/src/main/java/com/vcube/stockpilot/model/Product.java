package com.vcube.stockpilot.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Entity
@Table(name="products")
public class Product {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Long id;
    @Column(unique=true,nullable=false) public String sku;
    public String name;
    @ManyToOne(optional=false) public Supplier supplier;
    public int currentStock;
    public int minStock;
    public String warehouse = "Valencia Warehouse";
    public String category = "Components";
    @Column(precision=14,scale=2) public BigDecimal sellingPrice;
    public LocalDate createdOn;
}
