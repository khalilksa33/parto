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

-- Seed Tenants (Verified Saudi Automotive Distributors & Agencies)
-- Tashleeh scrapyards are temporarily commented out for launch
INSERT OR IGNORE INTO tenants (id, name, subdomain, status, business_type, owner_name, email, phone, logo, banner_gradient, commission_rate, rating) VALUES
('t-riyadh-oem', 'Riyadh OEM Parts Co.', 'riyadh-oem', 'active', 'new_auto_spare_parts', 'Eng. Mohaned Al-Otaibi', 'sales@riyadhoem.sa', '+966 50 112 3344', '⚙️', 'from-blue-600 to-indigo-900', 8.00, 4.95),
('t-wadi-uhud', 'Wadi Uhud Nissan Genuine Parts', 'wadi-uhud', 'active', 'new_auto_spare_parts', 'Sultan Al-Ghamdi', 'info@wadiuhud.sa', '+966 54 998 7766', '🏎️', 'from-rose-600 to-red-950', 8.00, 4.92),
('t-babkeer-mazda', 'Babkeer Auto Mazda Agency', 'babkeer-mazda', 'active', 'new_auto_spare_parts', 'Tariq Babkeer', 'parts@babkeer.sa', '+966 56 332 1100', '🔧', 'from-purple-600 to-pink-900', 8.00, 4.85),
('t-el-shafie', 'El-Shafie Auto Electrical & AC Components', 'el-shafie', 'active', 'new_auto_spare_parts', 'Haj Mahmoud El-Shafie', 'sales@elshafie.sa', '+966 53 881 2299', '⚡', 'from-amber-600 to-yellow-900', 8.00, 4.91),
('t-hamzah-sadiq', 'Hamzah Sadiq Japanese Suspension & Shocks', 'hamzah-sadiq', 'active', 'new_auto_spare_parts', 'Hamzah Sadiq Al-Bishi', 'info@hamzahsadiq.sa', '+966 57 114 8833', '🚗', 'from-indigo-600 to-violet-900', 8.00, 4.89),
('t-najm-satha', 'Najm Express Towing & Satha', 'najm-satha', 'active', 'tow_company', 'Faisal Al-Dawsari', 'dispatch@najmsatha.sa', '+966 58 776 5544', '🛻', 'from-amber-500 to-orange-850', 12.00, 4.90);
-- ('t-tashleeh-star', 'Al-Tashleeh Star Scrapyard', 'tashleeh-star', 'inactive', 'used_auto_spare_parts', 'Abu Fahad Al-Harbi', 'fahad@tashleehstar.sa', '+966 55 443 2211', '🚗', 'from-emerald-600 to-teal-900', 10.00, 4.88);

-- Seed Products (Genuine OEM New Parts)
INSERT OR IGNORE INTO products (id, tenant_id, name, brand_name, oem_part_number, price, category, description, compatibility, status, image, rating, featured, weight, length, width, height, stock_quantity) VALUES
-- Riyadh OEM Parts Co.
('p-toyota-pads', 't-riyadh-oem', 'Toyota Camry Genuine Ceramic Brake Pads Kit (04465-33471)', 'Toyota', '04465-33471', 385.00, 'Brakes & Suspension', 'Genuine Toyota front ceramic brake pad set with anti-squeal shims for Camry and Avalon (2018–2025).', '["Toyota", "Camry", "Avalon", "Lexus ES350"]', 'active', 'assets/images/parts/brakes.svg', 4.95, 1, 2.20, 20.00, 15.00, 8.00, 45),
('p-lexus-rotor', 't-riyadh-oem', 'Lexus ES350 / RX350 Genuine Front Brake Rotor Disc (43512-33140)', 'Lexus', '43512-33140', 640.00, 'Brakes & Suspension', 'Ventilated high-thermal dissipation genuine rotor engineered for smooth stopping on ES and RX series.', '["Lexus", "ES350", "RX350", "LX570"]', 'active', 'assets/images/parts/brakes.svg', 4.90, 1, 7.40, 34.00, 34.00, 8.00, 28),
('p-kia-timing-chain', 't-riyadh-oem', 'Kia K5 / Sportage Mobis Genuine Timing Chain & Tensioner Kit', 'Kia', '24321-2G111', 780.00, 'Engine Parts', 'OEM Hyundai/Kia Mobis full timing chain kit with hydraulic tensioner and guide rails.', '["Kia", "K5", "Sportage", "Sorento", "Hyundai Sonata"]', 'active', 'assets/images/parts/engine.svg', 4.88, 1, 2.10, 28.00, 22.00, 10.00, 30),
('p-bmw-m-brakes', 't-riyadh-oem', 'BMW M-Performance Brembo 4-Piston Caliper & Rotor Kit', 'BMW', '34112450161', 3850.00, 'Brakes & Suspension', 'Official BMW M Performance brake system upgrade kit with red calipers and slotted rotors.', '["BMW", "3 Series", "5 Series", "M3", "M340i"]', 'active', 'assets/images/parts/brakes.svg', 5.00, 1, 14.50, 45.00, 45.00, 25.00, 8),
('p-audi-matrix-led', 't-riyadh-oem', 'Audi A6 / Q7 Dynamic Matrix LED Headlamp Left (4K0-941-035)', 'Audi', '4K0-941-035', 4200.00, 'Exterior & Body', 'Original OEM Audi Matrix LED headlight assembly with sequential turn signals.', '["Audi", "A6", "A7", "Q7", "Q8"]', 'active', 'assets/images/parts/exterior.svg', 4.92, 1, 4.50, 60.00, 35.00, 30.00, 12),
('p-hyundai-air-filter', 't-riyadh-oem', 'Hyundai Elantra / Tucson Genuine High-Flow Air Filter Element', 'Hyundai', '28113-F2000', 75.00, 'Engine Parts', 'Mobis genuine engine air intake filter for optimal fuel efficiency and engine protection.', '["Hyundai", "Elantra", "Tucson", "Kia Sportage"]', 'active', 'assets/images/parts/engine.svg', 4.90, 0, 0.45, 26.00, 18.00, 5.00, 120),
('p-toyota-lc-fuelpump', 't-riyadh-oem', 'Toyota Land Cruiser 300 / Prado High-Pressure Fuel Pump (23100-24010)', 'Toyota', '23100-24010', 1450.00, 'Engine Parts', 'Genuine Denso/Toyota Japan high-pressure direct fuel pump assembly for Land Cruiser V6 twin turbo.', '["Toyota", "Land Cruiser", "Prado", "Lexus LX600"]', 'active', 'assets/images/parts/engine.svg', 4.96, 1, 2.80, 22.00, 18.00, 15.00, 20),
('p-toyota-waterpump', 't-riyadh-oem', 'Toyota Corolla / Yaris Genuine Engine Water Pump Assembly (16100-29206)', 'Toyota', '16100-29206', 295.00, 'Engine Parts', 'Original Toyota Aisin cooling system water pump with gasket seal for 1.5L and 2.0L engines.', '["Toyota", "Corolla", "Yaris", "Raize"]', 'active', 'assets/images/parts/engine.svg', 4.91, 0, 1.40, 18.00, 16.00, 14.00, 35),
('p-denso-sparkplugs', 't-riyadh-oem', 'Denso Toyota Genuine Iridium TT Spark Plugs Set of 4 (SK20R11)', 'Toyota', '90919-01210', 160.00, 'Electrical & Sensors', 'High-ignitability twin-tip iridium spark plugs for maximum acceleration and fuel economy.', '["Toyota", "Camry", "Corolla", "RAV4", "Avalon"]', 'active', 'assets/images/parts/engine.svg', 4.94, 0, 0.35, 12.00, 10.00, 4.00, 95),
('p-mercedes-air-strut', 't-riyadh-oem', 'Mercedes-Benz E-Class W213 Air Suspension Compressor (0993200104)', 'Mercedes', '0993200104', 2850.00, 'Brakes & Suspension', 'Genuine AMK/Mercedes airmatic suspension pump compressor for smooth ride height control.', '["Mercedes", "E-Class", "CLS", "S-Class"]', 'active', 'assets/images/parts/suspension.svg', 4.98, 1, 4.20, 30.00, 22.00, 20.00, 10),

-- Wadi Uhud Nissan Genuine Parts
('p-nissan-oil-pump', 't-wadi-uhud', 'Nissan Patrol Y62 V8 Genuine Engine Oil Pump Assembly', 'Nissan', '15010-1LA0A', 920.00, 'Engine Parts', 'Original Nissan Japan high-pressure oil pump for Patrol Safari and Y62 5.6L V8 engines.', '["Nissan", "Patrol", "Armada", "Titan"]', 'active', 'assets/images/parts/engine.svg', 4.98, 1, 3.80, 28.00, 24.00, 16.00, 18),
('p-nissan-patrol-pads', 't-wadi-uhud', 'Nissan Patrol Y62 Front Ceramic Brake Pads Set OEM (D1060-1LB0A)', 'Nissan', 'D1060-1LB0A', 420.00, 'Brakes & Suspension', 'Heavy-duty ceramic front brake pads for Nissan Patrol Y62 with anti-dust compound.', '["Nissan", "Patrol", "Armada", "Infiniti QX80"]', 'active', 'assets/images/parts/brakes.svg', 4.93, 1, 2.60, 22.00, 16.00, 9.00, 40),
('p-nissan-altima-alt', 't-wadi-uhud', 'Nissan Altima / Maxima OEM Engine Alternator 130A (23100-3TA1B)', 'Nissan', '23100-3TA1B', 1180.00, 'Electrical & Sensors', 'Genuine Valeo/Nissan 130-Amp high-efficiency alternator for stable electrical current.', '["Nissan", "Altima", "Maxima", "Murano"]', 'active', 'assets/images/parts/engine.svg', 4.89, 0, 6.20, 26.00, 24.00, 22.00, 15),
('p-nissan-patrol-shocks', 't-wadi-uhud', 'Nissan Patrol Y62 Rear Hydraulic Shock Absorbers Pair (56210-1LA8A)', 'Nissan', '56210-1LA8A', 750.00, 'Brakes & Suspension', 'Hitachi/Nissan genuine rear shock absorber struts engineered for rugged desert terrain.', '["Nissan", "Patrol", "Safari", "Infiniti QX80"]', 'active', 'assets/images/parts/suspension.svg', 4.92, 1, 5.80, 52.00, 18.00, 18.00, 22),
('p-infiniti-starter', 't-wadi-uhud', 'Infiniti QX80 / QX60 Genuine Engine Starter Motor (23300-1CA0B)', 'Nissan', '23300-1CA0B', 1290.00, 'Electrical & Sensors', 'Original Mitsuba/Nissan high-torque starter motor assembly for quick reliable ignition.', '["Nissan", "Patrol", "Infiniti QX80", "Infiniti QX60"]', 'active', 'assets/images/parts/engine.svg', 4.95, 0, 4.10, 25.00, 18.00, 16.00, 14),
('p-nissan-spark-plugs', 't-wadi-uhud', 'Nissan Genuine Laser Platinum Spark Plugs 6-Pack (DILKAR758G)', 'Nissan', '22401-1LA1C', 280.00, 'Electrical & Sensors', 'NGK/Nissan laser platinum spark plugs for V6 and V8 engines (Patrol, Maxima, Pathfinder).', '["Nissan", "Patrol", "Maxima", "Pathfinder"]', 'active', 'assets/images/parts/engine.svg', 4.90, 0, 0.50, 14.00, 12.00, 4.00, 60),

-- Babkeer Auto Mazda Agency
('p-mazda-spark-plugs', 't-babkeer-mazda', 'Mazda SkyActiv-G Laser Iridium Spark Plugs Set of 4 (PE5R-18-110)', 'Mazda', 'PE5R-18-110', 210.00, 'Electrical & Sensors', 'Genuine OEM Mazda SkyActiv high-performance spark plugs engineered for longevity.', '["Mazda", "Mazda 3", "Mazda 6", "CX-5", "CX-9"]', 'active', 'assets/images/parts/engine.svg', 4.94, 1, 0.35, 12.00, 10.00, 3.00, 80),
('p-mazda-cx9-rotors', 't-babkeer-mazda', 'Mazda CX-9 / CX-5 Front Ventilated Brake Discs Pair (K011-33-251A)', 'Mazda', 'K011-33-251A', 680.00, 'Brakes & Suspension', 'Genuine high-carbon heat-treated front brake rotor pair for Mazda SUV line.', '["Mazda", "CX-9", "CX-5", "CX-30"]', 'active', 'assets/images/parts/brakes.svg', 4.92, 1, 14.00, 32.00, 32.00, 12.00, 24),
('p-mazda-belt-tensioner', 't-babkeer-mazda', 'Mazda 6 / CX-5 Genuine SkyActiv Drive Belt Tensioner (PY01-15-980)', 'Mazda', 'PY01-15-980', 340.00, 'Engine Parts', 'OEM hydraulic serpentine drive belt tensioner assembly with pulley for smooth operation.', '["Mazda", "Mazda 6", "CX-5", "Mazda 3"]', 'active', 'assets/images/parts/engine.svg', 4.88, 0, 1.20, 16.00, 14.00, 10.00, 35),
('p-mazda-cx9-taillight', 't-babkeer-mazda', 'Mazda CX-9 Genuine LED Taillight Outer Assembly Left (TK78-51-160C)', 'Mazda', 'TK78-51-160C', 980.00, 'Exterior & Body', 'Original Koito/Mazda crystal LED tail lamp cluster with integrated turn signals.', '["Mazda", "CX-9"]', 'active', 'assets/images/parts/exterior.svg', 4.96, 0, 2.50, 48.00, 28.00, 22.00, 12),
('p-mazda-trans-filter', 't-babkeer-mazda', 'Mazda SkyActiv Automatic Transmission Fluid Filter Kit (FZ01-21-500)', 'Mazda', 'FZ01-21-500', 195.00, 'Transmission', 'Original Mazda 6-speed automatic transmission filter with pan gasket seal.', '["Mazda", "Mazda 3", "Mazda 6", "CX-5", "CX-9"]', 'active', 'assets/images/parts/engine.svg', 4.87, 0, 0.65, 20.00, 18.00, 6.00, 45),

-- El-Shafie Auto Electrical & AC Components
('p-denso-lc-compressor', 't-el-shafie', 'Denso OEM AC Compressor for Land Cruiser & Prado (88320-60700)', 'Toyota', '88320-60700', 1650.00, 'Engine Parts', 'Original Denso 10S20C heavy-duty automotive air conditioning compressor with clutch.', '["Toyota", "Land Cruiser", "Prado", "Lexus GX460"]', 'active', 'assets/images/parts/engine.svg', 4.97, 1, 7.80, 28.00, 22.00, 20.00, 16),
('p-camry-cooling-fan', 't-el-shafie', 'Genuine Toyota Camry / RAV4 Radiator Cooling Fan Assembly (16363-25010)', 'Toyota', '16363-25010', 520.00, 'Electrical & Sensors', 'Complete dual electric radiator fan assembly with brushless motor and shroud.', '["Toyota", "Camry", "RAV4", "Avalon"]', 'active', 'assets/images/parts/engine.svg', 4.90, 0, 3.40, 50.00, 45.00, 15.00, 25),
('p-bosch-agm-battery', 't-el-shafie', 'Bosch S5 High-Output 12V 80Ah AGM Automotive Battery (S5-A11)', 'Ford', 'S5-A11', 620.00, 'Electrical & Sensors', 'German-engineered AGM maintenance-free battery for modern start-stop vehicles.', '["Ford", "Chevrolet", "BMW", "Audi", "Mercedes"]', 'active', 'assets/images/parts/engine.svg', 4.93, 1, 21.00, 31.00, 17.50, 19.00, 30),
('p-prado-starter', 't-el-shafie', 'Toyota Prado / Fortuner Heavy-Duty Starter Motor (28100-0C080)', 'Toyota', '28100-0C080', 890.00, 'Electrical & Sensors', 'Genuine Denso 2.0kW reduction starter motor for Toyota 2.7L and 4.0L engines.', '["Toyota", "Prado", "Fortuner", "Hilux"]', 'active', 'assets/images/parts/engine.svg', 4.91, 0, 4.30, 24.00, 18.00, 15.00, 20),

-- Hamzah Sadiq Japanese Suspension & Shocks
('p-kyb-lc200-struts', 't-hamzah-sadiq', 'KYB Gas-A-Just Heavy-Duty Front Shock Absorbers Pair (551130)', 'Toyota', '551130', 850.00, 'Brakes & Suspension', 'Monotube high-pressure gas shocks for Land Cruiser 200 and Lexus LX570 stability.', '["Toyota", "Land Cruiser", "Lexus LX570"]', 'active', 'assets/images/parts/suspension.svg', 4.95, 1, 6.40, 55.00, 16.00, 16.00, 28),
('p-555-balljoints', 't-hamzah-sadiq', '555 Japan Lower Ball Joints Pair for Toyota Hilux & Fortuner (SB-3882)', 'Toyota', 'SB-3882', 260.00, 'Brakes & Suspension', 'Precision forged alloy lower ball joints made in Japan for heavy-duty load capacity.', '["Toyota", "Hilux", "Fortuner", "Prado"]', 'active', 'assets/images/parts/suspension.svg', 4.90, 0, 1.80, 18.00, 14.00, 8.00, 50),
('p-honda-accord-pads', 't-hamzah-sadiq', 'Honda Accord / Civic OEM Front Ceramic Brake Pads (45022-T2G-A01)', 'Honda', '45022-T2G-A01', 340.00, 'Brakes & Suspension', 'Genuine Nissin/Honda ceramic brake pads with minimal dust and quiet braking.', '["Honda", "Accord", "Civic", "CR-V"]', 'active', 'assets/images/parts/brakes.svg', 4.92, 0, 2.10, 20.00, 14.00, 8.00, 35),
('p-kyb-camry-shocks', 't-hamzah-sadiq', 'KYB Excel-G Rear Shock Absorbers Pair for Camry / Avalon (341386)', 'Toyota', '341386', 490.00, 'Brakes & Suspension', 'Twin-tube gas struts engineered to restore original factory ride control and handling.', '["Toyota", "Camry", "Avalon", "Lexus ES350"]', 'active', 'assets/images/parts/suspension.svg', 4.91, 0, 5.20, 50.00, 15.00, 15.00, 32);

-- Tashleeh / Used parts commented out for launch:
-- ('p-tashleeh-v6-engine', 't-tashleeh-star', 'Toyota Land Cruiser V6 4.0L Tested Complete Engine (Tashleeh)', 'Toyota', '1GR-FE', 5400.00, 'Engine Parts', ...);
-- ('p-tashleeh-gearbox', 't-tashleeh-star', 'Hyundai Accent / Elantra 6-Speed Automatic Transmission (Used)', 'Hyundai', 'A6GF1', 2100.00, 'Transmission', ...);

-- Seed Sample Notifications
INSERT OR IGNORE INTO notifications (id, recipient, title, message, link, is_read) VALUES
('notif-1', 'all', 'مرحباً بك في منصة بارتو', 'تم تحديث سوق قطع الغيار بالعديد من القطع الأصلية والموزعين المعتمدين.', 'index.php', 0),
('notif-2', 'all', 'خدمة سطحة فورية على مدار 24 ساعة', 'يمكنك الآن طلب سطحة نقل وسحب سيارات بضغطة زر مع تتبع مباشر.', 'towing.php', 0);

