package com.vcube.stockpilot.repository;

import com.vcube.stockpilot.model.Product;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from Product p where p.id=:id")
    Optional<Product> lockId(@Param("id") Long id);
    @Query("select p from Product p where p.currentStock <= p.minStock order by p.currentStock, p.id")
    List<Product> low();
}
