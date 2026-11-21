package com.vcube.stockpilot.repository;

import com.vcube.stockpilot.model.StockMovement;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface StockMovementRepository extends JpaRepository<StockMovement,Long> {
    List<StockMovement> findByProductIdOrderByCreatedAtDescIdDesc(Long id);
    List<StockMovement> findAllByOrderByCreatedAtDescIdDesc();
    List<StockMovement> findByReasonAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(String reason,java.time.Instant start,java.time.Instant end);
}
