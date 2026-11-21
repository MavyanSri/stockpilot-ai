package com.vcube.stockpilot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties={
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop",
    "JWT_SECRET=test-only-32-byte-key-for-integration-test","app.allowed-emails="})
class StockpilotApplicationTests {

	@Test
	void contextLoads() {
		org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder enc = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
		System.out.println("BCRYPT_ADMIN: " + enc.encode("Admin@12345"));
		System.out.println("BCRYPT_STAFF: " + enc.encode("Staff@12345"));
	}

}
