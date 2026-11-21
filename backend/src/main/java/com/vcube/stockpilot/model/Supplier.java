package com.vcube.stockpilot.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="suppliers")
public class Supplier {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Long id;
    @Column(nullable=false) public String name;
    public String phone;
    public int leadTimeDays;
}
