package com.vcube.stockpilot.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Entity
@Table(name="purchase_order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Long id;
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(optional=false) PurchaseOrder purchaseOrder;
    @ManyToOne(optional=false) public Product product;
    public int quantity;
    @Column(precision=14,scale=2) public BigDecimal unitCost;

    public void setPurchaseOrder(PurchaseOrder value) { this.purchaseOrder = value; }
}
