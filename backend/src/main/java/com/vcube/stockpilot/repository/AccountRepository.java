package com.vcube.stockpilot.repository;

import com.vcube.stockpilot.model.Account;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AccountRepository extends JpaRepository<Account,Long> {
    Optional<Account> findByEmail(String email);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select a from Account a where a.email=:email")
    Optional<Account> lockEmail(@Param("email") String email);
}
