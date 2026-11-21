USE stockpilot;

-- Ensure verified and role columns
UPDATE users SET verified = 1;
UPDATE users SET role = 'ADMIN' WHERE email LIKE '%admin%' OR email LIKE '%dinesh%' OR email LIKE '%y22%' OR email LIKE '%y2d%';

-- Insert Admin & Staff Accounts if not present
INSERT INTO users (email, name, passwordHash, verified, role, attempts)
SELECT 'admin@stockpilot.ai', 'Warehouse Administrator', '$2a$10$6UvxcE/W/e1T9GpeDFA36uQfDGb9EyW8Hg.2HqSpL7Id2AwwdH5Ly', 1, 'ADMIN', 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@stockpilot.ai');

INSERT INTO users (email, name, passwordHash, verified, role, attempts)
SELECT 'staff@stockpilot.ai', 'Floor Operator', '$2a$10$1UJcGjtQaF3BwTvSLksX8evdu5dQ035PPSsVL/qJnEMMwictcbZuW', 1, 'USER', 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff@stockpilot.ai');

-- Insert Suppliers if empty
INSERT INTO suppliers (id, name, phone, leadTimeDays) VALUES
(1, 'Apex Logistics Hardware', '+1-800-555-0199', 3),
(2, 'OmniTech IoT Systems', '+1-800-555-0245', 5),
(3, 'Global Packaging Solutions', '+1-800-555-0378', 2),
(4, 'Starlight Micro Optic', '+1-800-555-0412', 7),
(5, 'Velocity Industrial Robotics', '+1-800-555-0899', 4),
(6, 'Pacific Component Works', '+1-800-555-0720', 6)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert 16 Products across 5 Warehouses
INSERT INTO products (id, sku, name, currentStock, minStock, sellingPrice, createdOn, supplier_id, warehouse, category) VALUES
(1, 'SKU-BAR-9901', 'Wireless Barcode Scanner Pro', 45, 15, 89.99, CURDATE() - INTERVAL 10 DAY, 1, 'Valencia Warehouse', 'Serialized'),
(2, 'SKU-LBL-1020', 'Thermal Shipping Labels (Roll of 1000)', 8, 25, 14.50, CURDATE() - INTERVAL 10 DAY, 3, 'Florida Warehouse', 'Consumables'),
(3, 'SKU-SEN-4040', 'Industrial IoT Weight Sensor', 120, 30, 45.00, CURDATE() - INTERVAL 10 DAY, 2, 'Texas Warehouse', 'Components'),
(4, 'SKU-TPE-3302', 'Heavy Duty Filament Packing Tape', 6, 20, 9.75, CURDATE() - INTERVAL 10 DAY, 3, 'Chicago Warehouse', 'Consumables'),
(5, 'SKU-PLT-5511', 'High-Impact Poly Warehouse Bin', 75, 20, 22.00, CURDATE() - INTERVAL 10 DAY, 1, 'Brooklyn Warehouse', 'Kitted'),
(6, 'SKU-RDR-8800', 'RFID UHF Long-Range Portal Reader', 18, 10, 299.00, CURDATE() - INTERVAL 10 DAY, 2, 'Valencia Warehouse', 'Serialized'),
(7, 'SKU-CHG-1102', 'Multi-Dock Scanner Charging Hub', 14, 8, 129.00, CURDATE() - INTERVAL 10 DAY, 1, 'Florida Warehouse', 'Components'),
(8, 'SKU-SRT-7721', 'Conveyor Optical Sorting Module', 5, 10, 540.00, CURDATE() - INTERVAL 10 DAY, 4, 'Texas Warehouse', 'Components'),
(9, 'SKU-BAT-2201', 'High-Capacity Li-Ion Scanner Battery', 88, 25, 34.50, CURDATE() - INTERVAL 10 DAY, 6, 'Valencia Warehouse', 'Components'),
(10, 'SKU-WRP-9011', 'Heavy Duty Stretch Pallet Wrap', 4, 15, 28.00, CURDATE() - INTERVAL 10 DAY, 3, 'Chicago Warehouse', 'Consumables'),
(11, 'SKU-CRT-3301', 'Ergonomic Heavy Duty Picking Cart', 22, 5, 245.00, CURDATE() - INTERVAL 10 DAY, 5, 'Texas Warehouse', 'Kitted'),
(12, 'SKU-PRN-5520', 'Direct Thermal Desktop Label Printer', 16, 8, 219.00, CURDATE() - INTERVAL 10 DAY, 2, 'Florida Warehouse', 'Serialized'),
(13, 'SKU-CAB-7710', 'Industrial Braided USB-C Data Cable', 140, 40, 12.00, CURDATE() - INTERVAL 10 DAY, 6, 'Brooklyn Warehouse', 'Components'),
(14, 'SKU-SCL-6644', 'Precision Digital Platform Floor Scale', 9, 4, 380.00, CURDATE() - INTERVAL 10 DAY, 5, 'Valencia Warehouse', 'Serialized'),
(15, 'SKU-MNT-4401', 'Heavy Duty Swivel Forklift Scanner Mount', 31, 10, 49.99, CURDATE() - INTERVAL 10 DAY, 1, 'Chicago Warehouse', 'Components'),
(16, 'SKU-ANT-8812', 'High-Gain RFID Reader Antenna', 3, 12, 110.00, CURDATE() - INTERVAL 10 DAY, 2, 'Valencia Warehouse', 'Components')
ON DUPLICATE KEY UPDATE name=VALUES(name), currentStock=VALUES(currentStock), warehouse=VALUES(warehouse);

-- Insert Purchase Orders
INSERT INTO purchase_orders (id, expectedAt, orderedAt, status, createdBy_id, supplier_id) VALUES
(1, CURDATE() + INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, 'ORDERED', 1, 1),
(2, CURDATE() + INTERVAL 1 DAY, NOW() - INTERVAL 2 DAY, 'ORDERED', 1, 3),
(3, CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 5 DAY, 'RECEIVED', 1, 2),
(4, CURDATE() + INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY, 'ORDERED', 1, 4)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Insert Purchase Order Items
INSERT INTO purchase_order_items (id, quantity, unitCost, product_id, purchaseOrder_id) VALUES
(1, 20, 62.99, 1, 1),
(2, 100, 10.15, 2, 2),
(3, 10, 209.30, 6, 3),
(4, 15, 378.00, 8, 4)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- Insert Stock Movements (Inbounds and Sales)
INSERT INTO stock_transactions (id, createdAt, quantity, reason, type, unitSalePrice, product_id, recordedBy_id) VALUES
(1, NOW() - INTERVAL 10 DAY, 45, 'PURCHASE', 'IN', 89.99, 1, 1),
(2, NOW() - INTERVAL 2 DAY, 8, 'SALE', 'OUT', 89.99, 1, 1),
(3, NOW() - INTERVAL 8 DAY, 50, 'PURCHASE', 'IN', 14.50, 2, 1),
(4, NOW() - INTERVAL 1 DAY, 42, 'SALE', 'OUT', 14.50, 2, 1),
(5, NOW() - INTERVAL 12 DAY, 120, 'PURCHASE', 'IN', 45.00, 3, 1),
(6, NOW() - INTERVAL 3 DAY, 15, 'SALE', 'OUT', 45.00, 3, 1),
(7, NOW() - INTERVAL 7 DAY, 30, 'PURCHASE', 'IN', 9.75, 4, 1),
(8, NOW() - INTERVAL 1 DAY, 24, 'SALE', 'OUT', 9.75, 4, 1),
(9, NOW() - INTERVAL 14 DAY, 75, 'PURCHASE', 'IN', 22.00, 5, 1),
(10, NOW() - INTERVAL 6 DAY, 20, 'PURCHASE', 'IN', 299.00, 6, 1),
(11, NOW() - INTERVAL 1 DAY, 2, 'SALE', 'OUT', 299.00, 6, 1),
(12, NOW() - INTERVAL 5 DAY, 14, 'PURCHASE', 'IN', 129.00, 7, 1),
(13, NOW() - INTERVAL 4 DAY, 5, 'PURCHASE', 'IN', 540.00, 8, 1),
(14, NOW() - INTERVAL 9 DAY, 88, 'PURCHASE', 'IN', 34.50, 9, 1),
(15, NOW() - INTERVAL 7 DAY, 25, 'PURCHASE', 'IN', 28.00, 10, 1),
(16, NOW() - INTERVAL 1 DAY, 21, 'SALE', 'OUT', 28.00, 10, 1),
(17, NOW() - INTERVAL 15 DAY, 22, 'PURCHASE', 'IN', 245.00, 11, 1),
(18, NOW() - INTERVAL 11 DAY, 16, 'PURCHASE', 'IN', 219.00, 12, 1),
(19, NOW() - INTERVAL 6 DAY, 140, 'PURCHASE', 'IN', 12.00, 13, 1),
(20, NOW() - INTERVAL 13 DAY, 9, 'PURCHASE', 'IN', 380.00, 14, 1),
(21, NOW() - INTERVAL 5 DAY, 31, 'PURCHASE', 'IN', 49.99, 15, 1),
(22, NOW() - INTERVAL 8 DAY, 15, 'PURCHASE', 'IN', 110.00, 16, 1),
(23, NOW() - INTERVAL 2 DAY, 12, 'SALE', 'OUT', 110.00, 16, 1)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
