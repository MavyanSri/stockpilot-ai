package com.vcube.stockpilot.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Entity
@Table(name="stock_transactions")
public class StockMovement {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional=false) public Product product;
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(optional=false) Account recordedBy;
    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne @JoinColumn(unique=true) OrderItem orderItem;
    public String type;
    public String reason;
    public int quantity;
    @Column(precision=14,scale=2) public BigDecimal unitSalePrice;
    public Instant createdAt;

    public void setRecordedBy(Account value) { this.recordedBy = value; }

    public void setOrderItem(OrderItem value) { this.orderItem = value; }
}
