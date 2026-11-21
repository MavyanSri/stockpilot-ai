package com.vcube.stockpilot.config;

import com.vcube.stockpilot.model.*;
import com.vcube.stockpilot.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accounts;
    private final SupplierRepository suppliers;
    private final ProductRepository products;
    private final StockMovementRepository movements;
    private final PurchaseOrderRepository orders;
    private final BCryptPasswordEncoder encoder;

    public DataInitializer(
        AccountRepository accounts,
        SupplierRepository suppliers,
        ProductRepository products,
        StockMovementRepository movements,
        PurchaseOrderRepository orders,
        BCryptPasswordEncoder encoder
    ) {
        this.accounts = accounts;
        this.suppliers = suppliers;
        this.products = products;
        this.movements = movements;
        this.orders = orders;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        // 1. Setup Admin Account with guaranteed password Admin@12345
        Account admin = accounts.findByEmail("admin@stockpilot.ai").orElseGet(Account::new);
        admin.email = "admin@stockpilot.ai";
        admin.name = "Warehouse Administrator";
        admin.passwordHash = encoder.encode("Admin@12345");
        admin.verified = true;
        admin.role = "ADMIN";
        accounts.save(admin);

        // 2. Setup Staff Account with guaranteed password Staff@12345
        Account staff = accounts.findByEmail("staff@stockpilot.ai").orElseGet(Account::new);
        staff.email = "staff@stockpilot.ai";
        staff.name = "Floor Operator";
        staff.passwordHash = encoder.encode("Staff@12345");
        staff.verified = true;
        staff.role = "USER";
        accounts.save(staff);

        // 3. Update any existing accounts to work with Admin@12345
        for (String email : List.of("admin@stockpilot.com", "y22cd@gmail.com", "y2d@gmail.com", "dinesh@gmail.com")) {
            accounts.findByEmail(email).ifPresent(u -> {
                u.passwordHash = encoder.encode("Admin@12345");
                u.verified = true;
                u.role = "ADMIN";
                accounts.save(u);
            });
        }
    }
}
