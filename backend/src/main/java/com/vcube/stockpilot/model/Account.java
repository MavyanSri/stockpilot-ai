package com.vcube.stockpilot.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="users")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"email","name","passwordHash","verified","otpHash","otpExpires","lastSent","attempts"})
public class Account {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Long id;
    @Column(unique=true,nullable=false) public String email;
    public String name;
    public String passwordHash;
    public boolean verified;
    public String role = "ADMIN";
    public String otpHash;
    public Instant otpExpires;
    public Instant lastSent;
    public int attempts;
}
