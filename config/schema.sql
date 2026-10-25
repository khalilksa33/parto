-- ========================================================
-- PARTO Multi-Tenant Automotive Marketplace Database Schema
-- Compatible with MySQL 5.7+ / MariaDB 10.3+ and SQLite
-- ========================================================

-- 1. Tenants Table (Vendors, Scrapyards, Workshops, Towing)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    business_type VARCHAR(100) NOT NULL DEFAULT 'new_auto_spare_parts',
    owner_name VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    logo VARCHAR(20) DEFAULT '⚙️',
    banner_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-indigo-900',
    commission_rate DECIMAL(5,2) DEFAULT 8.00,
    warehouse_address TEXT NULL,
    rating DECIMAL(3,2) DEFAULT 4.90,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'vendor',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    oem_part_number VARCHAR(100) NULL,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) NOT NULL,
    description TEXT NULL,
    compatibility TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    image TEXT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.90,
    featured INT DEFAULT 1,
    weight DECIMAL(10, 2) DEFAULT 1.50,
    length DECIMAL(10, 2) DEFAULT 20.00,
    width DECIMAL(10, 2) DEFAULT 15.00,
    height DECIMAL(10, 2) DEFAULT 10.00,
    stock_quantity INT DEFAULT 25,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NULL,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255) NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    shipping_provider VARCHAR(100) DEFAULT 'SMSA Express',
    shipping_fee DECIMAL(10, 2) DEFAULT 25.00,
    payment_method VARCHAR(50) DEFAULT 'mada',
    payment_status VARCHAR(50) DEFAULT 'completed',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    items_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Part Requests (Tashleeh RFQ from Customers)
CREATE TABLE IF NOT EXISTS part_requests (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    vehicle_make VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year VARCHAR(20) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    vin VARCHAR(50) NULL,
    notes TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Part Quotes (Quotes Submitted by Tashleeh Yards)
CREATE TABLE IF NOT EXISTS part_quotes (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    condition_state VARCHAR(50) NOT NULL DEFAULT 'Used - Grade A',
    notes TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Dispatches (Roadside Towing & Mobile Workshops)
CREATE TABLE IF NOT EXISTS dispatches (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NULL,
    service_type VARCHAR(50) NOT NULL DEFAULT 'tow',
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    vehicle_details VARCHAR(255) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    quote VARCHAR(50) NULL,
    accepted_by VARCHAR(64) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. VIN Decoder Cache
CREATE TABLE IF NOT EXISTS vin_cache (
    vin VARCHAR(50) PRIMARY KEY,
    make VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    year VARCHAR(20) NULL,
    engine_details TEXT NULL,
    raw_data TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Real-time Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient VARCHAR(100) NOT NULL DEFAULT 'all',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255) NULL,
    is_read INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

-- Seed Tenants (Verified Saudi Vendors & Tashleeh)
INSERT OR IGNORE INTO tenants (id, name, subdomain, status, business_type, owner_name, email, phone, logo, banner_gradient, commission_rate, rating) VALUES
('t-riyadh-oem', 'Riyadh OEM Parts Co.', 'riyadh-oem', 'active', 'new_auto_spare_parts', 'Eng. Mohaned Al-Otaibi', 'sales@riyadhoem.sa', '+966 50 112 3344', '⚙️', 'from-blue-600 to-indigo-900', 8.00, 4.95),
('t-tashleeh-star', 'Al-Tashleeh Star Scrapyard', 'tashleeh-star', 'active', 'used_auto_spare_parts', 'Abu Fahad Al-Harbi', 'fahad@tashleehstar.sa', '+966 55 443 2211', '🚗', 'from-emerald-600 to-teal-900', 10.00, 4.88),
('t-wadi-uhud', 'Wadi Uhud Nissan Genuine Parts', 'wadi-uhud', 'active', 'new_auto_spare_parts', 'Sultan Al-Ghamdi', 'info@wadiuhud.sa', '+966 54 998 7766', '🏎️', 'from-rose-600 to-red-950', 8.00, 4.92),
('t-babkeer-mazda', 'Babkeer Auto Mazda Agency', 'babkeer-mazda', 'active', 'new_auto_spare_parts', 'Tariq Babkeer', 'parts@babkeer.sa', '+966 56 332 1100', '🔧', 'from-purple-600 to-pink-900', 8.00, 4.85),
('t-najm-satha', 'Najm Express Towing & Satha', 'najm-satha', 'active', 'tow_company', 'Faisal Al-Dawsari', 'dispatch@najmsatha.sa', '+966 58 776 5544', '🛻', 'from-amber-500 to-orange-850', 12.00, 4.90);

-- Seed Products
INSERT OR IGNORE INTO products (id, tenant_id, name, brand_name, oem_part_number, price, category, description, compatibility, status, image, rating, featured, weight, length, width, height, stock_quantity) VALUES
('p-toyota-pads', 't-riyadh-oem', 'Toyota Camry Genuine Ceramic Brake Pads Kit (04465-33471)', 'Toyota', '04465-33471', 385.00, 'Brakes & Suspension', 'Genuine Toyota front ceramic brake pad set with anti-squeal shims for Camry and Avalon (2018–2025).', '["Toyota", "Camry", "Avalon", "Lexus ES350"]', 'active', 'assets/images/parts/brakes.svg', 4.95, 1, 2.20, 20.00, 15.00, 8.00, 45),
('p-lexus-rotor', 't-riyadh-oem', 'Lexus ES350 / RX350 Genuine Front Brake Rotor Disc (43512-33140)', 'Lexus', '43512-33140', 640.00, 'Brakes & Suspension', 'Ventilated high-thermal dissipation genuine rotor engineered for smooth stopping on ES and RX series.', '["Lexus", "ES350", "RX350", "LX570"]', 'active', 'assets/images/parts/brakes.svg', 4.90, 1, 7.40, 34.00, 34.00, 8.00, 28),
('p-nissan-oil-pump', 't-wadi-uhud', 'Nissan Patrol Y62 V8 Genuine Engine Oil Pump Assembly', 'Nissan', '15010-1LA0A', 920.00, 'Engine Parts', 'Original Nissan Japan high-pressure oil pump for Patrol Safari and Y62 5.6L V8 engines.', '["Nissan", "Patrol", "Armada", "Titan"]', 'active', 'assets/images/parts/engine.svg', 4.98, 1, 3.80, 28.00, 24.00, 16.00, 18),
('p-kia-timing-chain', 't-riyadh-oem', 'Kia K5 / Sportage Mobis Genuine Timing Chain & Tensioner Kit', 'Kia', '24321-2G111', 780.00, 'Engine Parts', 'OEM Hyundai/Kia Mobis full timing chain kit with hydraulic tensioner and guide rails.', '["Kia", "K5", "Sportage", "Sorento", "Hyundai Sonata"]', 'active', 'assets/images/parts/engine.svg', 4.88, 1, 2.10, 28.00, 22.00, 10.00, 30),
('p-bmw-m-brakes', 't-riyadh-oem', 'BMW M-Performance Brembo 4-Piston Caliper & Rotor Kit', 'BMW', '34112450161', 3850.00, 'Brakes & Suspension', 'Official BMW M Performance brake system upgrade kit with red calipers and slotted rotors.', '["BMW", "3 Series", "5 Series", "M3", "M340i"]', 'active', 'assets/images/parts/brakes.svg', 5.00, 1, 14.50, 45.00, 45.00, 25.00, 8),
('p-audi-matrix-led', 't-riyadh-oem', 'Audi A6 / Q7 Dynamic Matrix LED Headlamp Left (4K0-941-035)', 'Audi', '4K0-941-035', 4200.00, 'Exterior & Body', 'Original OEM Audi Matrix LED headlight assembly with sequential turn signals.', '["Audi", "A6", "A7", "Q7", "Q8"]', 'active', 'assets/images/parts/exterior.svg', 4.92, 1, 4.50, 60.00, 35.00, 30.00, 12),
('p-tashleeh-v6-engine', 't-tashleeh-star', 'Toyota Land Cruiser V6 4.0L Tested Complete Engine (Tashleeh)', 'Toyota', '1GR-FE', 5400.00, 'Engine Parts', 'Low-mileage tested 1GR-FE engine with 30-day warranty. Imported from clean salvage vehicle.', '["Toyota", "Land Cruiser", "Prado", "FJ Cruiser"]', 'active', 'assets/images/parts/engine.svg', 4.85, 1, 175.00, 85.00, 75.00, 85.00, 3),
('p-tashleeh-gearbox', 't-tashleeh-star', 'Hyundai Accent / Elantra 6-Speed Automatic Transmission (Used)', 'Hyundai', 'A6GF1', 2100.00, 'Transmission', 'Tested smooth-shifting automatic gearbox with torque converter. Inspected by expert mechanics.', '["Hyundai", "Accent", "Elantra", "Kia Cerato"]', 'active', 'assets/images/parts/engine.svg', 4.80, 0, 65.00, 60.00, 50.00, 50.00, 5),
('p-hyundai-air-filter', 't-riyadh-oem', 'Hyundai Elantra / Tucson Genuine High-Flow Air Filter Element', 'Hyundai', '28113-F2000', 75.00, 'Engine Parts', 'Mobis genuine engine air intake filter for optimal fuel efficiency and engine protection.', '["Hyundai", "Elantra", "Tucson", "Kia Sportage"]', 'active', 'assets/images/parts/engine.svg', 4.90, 0, 0.45, 26.00, 18.00, 5.00, 120),
('p-mazda-spark-plugs', 't-babkeer-mazda', 'Mazda SkyActiv-G Laser Iridium Spark Plugs Set of 4 (PE5R-18-110)', 'Mazda', 'PE5R-18-110', 210.00, 'Electrical & Sensors', 'Genuine OEM Mazda SkyActiv high-performance spark plugs engineered for longevity.', '["Mazda", "Mazda 3", "Mazda 6", "CX-5", "CX-9"]', 'active', 'assets/images/parts/engine.svg', 4.94, 1, 0.35, 12.00, 10.00, 3.00, 80);

-- Seed Sample Notifications
INSERT OR IGNORE INTO notifications (id, recipient, title, message, link, is_read) VALUES
('notif-1', 'all', 'مرحباً بك في منصة بارتو', 'تم تحديث سوق قطع الغيار بالعديد من القطع الأصلية وبائعي التشليح المعتمدين.', 'index.php', 0),
('notif-2', 'all', 'خدمة سطحة فورية على مدار 24 ساعة', 'يمكنك الآن طلب سطحة نقل وسحب سيارات بضغطة زر مع تتبع مباشر.', 'towing.php', 0);
