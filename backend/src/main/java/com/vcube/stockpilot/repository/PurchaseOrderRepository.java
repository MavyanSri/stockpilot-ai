package com.vcube.stockpilot.repository;

import com.vcube.stockpilot.model.PurchaseOrder;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder,Long> {
    long countByStatus(String status);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select o from PurchaseOrder o where o.id=:id")
    Optional<PurchaseOrder> lockId(@Param("id") Long id);
}
