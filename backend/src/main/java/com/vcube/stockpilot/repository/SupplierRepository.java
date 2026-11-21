package com.vcube.stockpilot.repository;

import com.vcube.stockpilot.model.Supplier;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface SupplierRepository extends JpaRepository<Supplier,Long> {}
