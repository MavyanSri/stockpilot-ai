package com.vcube.stockpilot.repository;

import com.vcube.stockpilot.model.OrderItem;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
    @Query("select coalesce(sum(i.quantity),0) from OrderItem i where i.product.id=:id and i.purchaseOrder.status='ORDERED' and i.purchaseOrder.expectedAt between :today and :end")
    long incoming(@Param("id") Long id,@Param("today") java.time.LocalDate today,@Param("end") java.time.LocalDate end);
}
