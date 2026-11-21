# StockPilot frontend API
Base URL `http://localhost:8080/api`. All successful requests below return HTTP 200 and JSON. Send `Authorization: Bearer <accessToken>` except on the four auth routes. Request bodies use `Content-Type: application/json`.
One shared login and one Overview dashboard. All verified team members can use every inventory screen. Purchase orders are internal supplier orders. A manager confirms the PO and separately records the physical receipt.
Example placeholders like {{productId}} represent numeric IDs from earlier calls. Dates are ISO yyyy-MM-dd, ranges include both ends in the backend timezone. Monetary values are decimal numbers.

## 1. Register and log in

### Register
`POST /auth/register`

Request example
```json
{
  "name": "Inventory Manager",
  "email": "{{email}}",
  "password": "{{password}}"
}
```
**HTTP 200.** Returns message and email. Valid email and password of 8–64 characters (up to 72 UTF-8 bytes). User account is immediately activated (OTP requirement removed).

### Verify code (Optional backward compatibility)
`POST /auth/verify-otp`

Request example
```json
{
  "email": "{{email}}",
  "otp": "000000"
}
```
**HTTP 200.** Returns message. Direct verification fallback.

### Log in and save token
`POST /auth/login`

Request example
```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```
**HTTP 200.** Returns accessToken, tokenType, expiresIn, name and role. Use this bearer token in the `Authorization: Bearer <accessToken>` header for all other endpoints.


## 2. Supplier and product screens

### Create supplier
`POST /suppliers`

Request example
```json
{
  "name": "City Electronics",
  "phone": "9876500000",
  "leadTimeDays": 5
}
```
**HTTP 200.** Supplier object with id, name, phone and leadTimeDays.

### List suppliers
`GET /suppliers`

**HTTP 200.** Array of supplier objects for the supplier dropdown.

### Edit supplier
`PUT /suppliers/{{supplierId}}`

Request example
```json
{
  "name": "City Electronics",
  "phone": "9876500000",
  "leadTimeDays": 5
}
```
**HTTP 200.** Updated supplier object.

### Create product
`POST /products`

Request example
```json
{
  "sku": "{{sku}}",
  "name": "USB-C Cable",
  "supplierId": 1,
  "minStock": 4,
  "sellingPrice": 100
}
```
**HTTP 200.** Product object with id, sku, name, nested supplier, minStock, sellingPrice, currentStock (starts at zero) and createdOn.

### List products
`GET /products`

**HTTP 200.** Array of product objects. Bind each product’s id as the selection value.

### Edit product
`PUT /products/{{productId}}`

Request example
```json
{
  "sku": "{{sku}}",
  "name": "USB-C Cable",
  "supplierId": 1,
  "minStock": 4,
  "sellingPrice": 100
}
```
**HTTP 200.** Updated product. Adjust stock through stock movements.


## 3. Stock, dashboard and sales

### Opening stock of 6
`POST /stock-transactions`

Request example
```json
{
  "productId": 1,
  "type": "IN",
  "reason": "OPENING",
  "quantity": 6
}
```
**HTTP 200.** transactionId, productId, previousStock, currentStock, lowStock.

### Sell 2 cables
`POST /stock-transactions`

Request example
```json
{
  "productId": 1,
  "type": "OUT",
  "reason": "SALE",
  "quantity": 2
}
```
**HTTP 200.** For a new demo product, previousStock 6, currentStock 4, lowStock true. OUT/DAMAGE also removes units and is excluded from sales.

### Reject overselling
`POST /stock-transactions`

Request example
```json
{
  "productId": 1,
  "type": "OUT",
  "reason": "SALE",
  "quantity": 5
}
```
**HTTP 409.** message: Insufficient stock. Balance stays 4.

### Stock history
`GET /stock-transactions?productId={{productId}}`

**HTTP 200.** Array of id, product, type, reason, quantity, unitSalePrice and createdAt. Omit productId to list all.

### Dashboard
`GET /dashboard/summary`

**HTTP 200.** productCount, lowStockCount, openOrderCount, todayUnitsSold and todayRevenue.

### Low stock
`GET /alerts/low-stock`

**HTTP 200.** Array of product objects with currentStock <= minStock.

### Sales report
`GET /reports/sales?from={{fromDate}}&to={{toDate}}`

**HTTP 200.** from, to, unitsSold, revenue, products[]. Each row has productId, name, units and revenue. Highest units first.


## 4. AI and purchase decisions

### Demand forecast
`GET /ai/forecast?productId={{productId}}&days=7`

**HTTP 200.** productId, name, days, observedDays, dailyAverage, projectedUnits, history[{date,units}], method. Horizon 1–90 days.

### Optimization assistant
`GET /ai/stock-insights?productId={{productId}}`

**HTTP 200.** data (productId, name, supplierId, supplier, currentStock, leadTimeDays, daysOfStock, targetStock, incomingUnits, suggestedQuantity, risk, forecast), source, explanation. daysOfStock is null for zero demand.

### Purchase suggestions
`GET /ai/purchase-recommendations`

**HTTP 200.** data[] contains optimization rows with positive suggestedQuantity. source and explanation describe the highest recommendation. Review in UI and explicitly POST the PO.

### Ask inventory
`POST /ai/ask`

Request example
```json
{
  "question": "What were the top selling products in the last 7 days?"
}
```
**HTTP 200.** answer, report and data contain a grounded answer and its evidence. Requires working LLM. Unsupported question returns 400; unavailable provider returns 503.


## 5. Purchase order and receipt

### Place supplier order
`POST /purchase-orders`

Request example
```json
{
  "supplierId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 8,
      "unitCost": 60
    }
  ]
}
```
**HTTP 200.** id, supplier, status ORDERED, orderedAt, expectedAt, items[{id,product,quantity,unitCost}]. Optional expectedAt defaults to today plus supplier lead time. No stock change.

### List orders
`GET /purchase-orders`

**HTTP 200.** Array of purchase orders, newest first.

### Order details
`GET /purchase-orders/{{orderId}}`

**HTTP 200.** Purchase order including all line items.

### Receive full order
`POST /purchase-orders/{{orderId}}/receive`

**HTTP 200.** Order status RECEIVED. The demo product increases from 4 to 12; one stock-in transaction per line.

### Reject duplicate receipt
`POST /purchase-orders/{{orderId}}/receive`

**HTTP 409.** message: Order already received.


## Optional — resend only while registration is pending

### Resend registration OTP
`POST /auth/resend-otp`

Request example
```json
{
  "email": "{{email}}"
}
```
**HTTP 200.** New code replaces the old one. Wait 60 seconds between emails. Codes expire in 10 minutes and permit five incorrect entries.

## Errors
400 invalid input or unsupported analytics question, 401 invalid credentials or expired/missing token, 403 unverified account or team restriction, 404 unknown ID, 409 insufficient stock/duplicate SKU/duplicate receipt, 429 OTP cooldown, 503 SMTP or AI provider unavailable. Application error bodies include message; validation errors also include fields. A rejected bearer token can have an empty body.