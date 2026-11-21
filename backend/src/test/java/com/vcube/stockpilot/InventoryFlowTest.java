package com.vcube.stockpilot;

import com.vcube.stockpilot.service.OtpMailService;
import com.vcube.stockpilot.service.LlmClient;
import static org.junit.jupiter.api.Assertions.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties={
    "spring.datasource.url=jdbc:h2:mem:flow;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop",
    "JWT_SECRET=test-only-32-byte-key-for-integration-test","app.allowed-emails="})
class InventoryFlowTest {
    @Value("${local.server.port}") int port;
    @MockitoBean OtpMailService mail;
    @MockitoBean LlmClient llm;

    @Test void verifyOrderSaleAndReport() {
        var client = RestClient.create("http://localhost:" + port + "/api");
        var denied = assertThrows(RestClientResponseException.class,
            () -> client.get().uri("/suppliers").retrieve().toBodilessEntity());
        assertEquals(401, denied.getStatusCode().value());
        assertTrue(denied.getResponseBodyAsString().contains("Bearer token"));

        var email = "demo@example.test";
        var login = Map.of("email", email, "password", "TestOnly123");
        client.post().uri("/auth/register").body(Map.of("name", "Demo", "email", email, "password", "TestOnly123")).retrieve().toBodilessEntity();

        var token = client.post().uri("/auth/login").body(login).retrieve().body(Map.class).get("accessToken").toString();
        assertNotNull(token);

        var api = RestClient.builder().baseUrl("http://localhost:" + port + "/api").defaultHeader("Authorization", "Bearer " + token).build();
        var supplier = api.post().uri("/suppliers").body(Map.of("name", "Supply Co", "leadTimeDays", 3)).retrieve().body(Map.class).get("id");
        var product = api.post().uri("/products").body(Map.of("name", "Cable", "sku", "CABLE", "supplierId", supplier, "sellingPrice", 50, "minStock", 4)).retrieve().body(Map.class).get("id");
        var order = api.post().uri("/purchase-orders").body(Map.of("supplierId", supplier, "items", List.of(Map.of("productId", product, "quantity", 5, "unitCost", 20)))).retrieve().body(Map.class).get("id");

        var receive = "/purchase-orders/" + order + "/receive";
        api.post().uri(receive).retrieve().toBodilessEntity();
        assertEquals(409, assertThrows(RestClientResponseException.class, () -> api.post().uri(receive).retrieve().toBodilessEntity()).getStatusCode().value());

        var sale = api.post().uri("/stock-transactions").body(Map.of("productId", product, "type", "OUT", "reason", "SALE", "quantity", 2)).retrieve().body(Map.class);
        assertEquals(3, ((Number) sale.get("currentStock")).intValue());
        assertEquals(true, sale.get("lowStock"));

        var summary = api.get().uri("/dashboard/summary").retrieve().body(Map.class);
        assertEquals(100, ((Number) summary.get("todayRevenue")).intValue());
        assertEquals(0, ((Number) summary.get("openOrderCount")).intValue());
        assertEquals(409, assertThrows(RestClientResponseException.class, () -> api.post().uri("/stock-transactions").body(Map.of("productId", product, "type", "OUT", "reason", "SALE", "quantity", 4)).retrieve().toBodilessEntity()).getStatusCode().value());
    }
}
