package com.vcube.stockpilot.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="purchase_orders")
public class PurchaseOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional=false) public Supplier supplier;
    public String status;
    public Instant orderedAt;
    public LocalDate expectedAt;
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(optional=false) Account createdBy;
    @OneToMany(mappedBy="purchaseOrder",cascade=CascadeType.ALL) @OrderBy("id") public List<OrderItem> items=new ArrayList<>();

    public void setCreatedBy(Account value) { this.createdBy = value; }
}
