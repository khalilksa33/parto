<?php
/**
 * PARTO API - Tenants & Vendor Onboarding Endpoint
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $subdomain = $_GET['subdomain'] ?? null;

            if ($id) {
                $stmt = $db->prepare("SELECT * FROM tenants WHERE id = :id LIMIT 1");
                $stmt->execute([':id' => $id]);
                $tenant = $stmt->fetch();
                if (!$tenant) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Tenant not found']);
                    exit;
                }
                echo json_encode(['success' => true, 'tenant' => $tenant]);
                exit;
            }

            if ($subdomain) {
                $stmt = $db->prepare("SELECT * FROM tenants WHERE subdomain = :subdomain LIMIT 1");
                $stmt->execute([':subdomain' => $subdomain]);
                $tenant = $stmt->fetch();
                if (!$tenant) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Tenant not found']);
                    exit;
                }
                echo json_encode(['success' => true, 'tenant' => $tenant]);
                exit;
            }

            // Return all active tenants
            $stmt = $db->query("SELECT * FROM tenants WHERE status = 'active' ORDER BY rating DESC");
            $tenants = $stmt->fetchAll();
            echo json_encode(['success' => true, 'count' => count($tenants), 'tenants' => $tenants]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            $name = trim($input['name'] ?? '');
            $subdomain = strtolower(trim(preg_replace('/[^a-zA-Z0-9-]/', '', $input['subdomain'] ?? '')));
            $businessType = $input['businessType'] ?? $input['business_type'] ?? 'new_auto_spare_parts';
            $ownerName = trim($input['ownerName'] ?? $input['owner_name'] ?? '');
            $email = trim($input['email'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $logo = $input['logo'] ?? '⚙️';
            $bannerGradient = $input['bannerGradient'] ?? $input['banner_gradient'] ?? 'from-blue-600 to-indigo-900';
            $warehouseAddress = trim($input['warehouseAddress'] ?? $input['warehouse_address'] ?? '');

            if (empty($name) || empty($subdomain)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Business name and subdomain are required']);
                exit;
            }

            // Check subdomain uniqueness
            $checkStmt = $db->prepare("SELECT id FROM tenants WHERE subdomain = :subdomain LIMIT 1");
            $checkStmt->execute([':subdomain' => $subdomain]);
            if ($checkStmt->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => 'Store username / subdomain is already taken']);
                exit;
            }

            global $commissionRates;
            $commRate = $commissionRates[$businessType] ?? 8.00;
            $tenantId = 't-' . $subdomain . '-' . substr(md5(uniqid()), 0, 6);

            $insertStmt = $db->prepare("INSERT INTO tenants (
                id, name, subdomain, status, business_type, owner_name, email, phone, 
                logo, banner_gradient, commission_rate, warehouse_address, rating
            ) VALUES (
                :id, :name, :subdomain, 'active', :business_type, :owner_name, :email, :phone,
                :logo, :banner_gradient, :commission_rate, :warehouse_address, 5.00
            )");

            $insertStmt->execute([
                ':id' => $tenantId,
                ':name' => $name,
                ':subdomain' => $subdomain,
                ':business_type' => $businessType,
                ':owner_name' => $ownerName,
                ':email' => $email,
                ':phone' => $phone,
                ':logo' => $logo,
                ':banner_gradient' => $bannerGradient,
                ':commission_rate' => $commRate,
                ':warehouse_address' => $warehouseAddress,
            ]);

            // Auto-create a starter product based on business type
            $starterName = 'Starter Part Listing';
            $starterCategory = 'Engine Parts';
            $starterPrice = 250.00;
            $starterImg = 'assets/images/parts/engine.svg';

            if ($businessType === 'used_auto_spare_parts') {
                $starterName = 'Used V6 Engine Hood Panel (Tashleeh)';
                $starterCategory = 'Exterior & Body';
                $starterPrice = 450.00;
                $starterImg = 'assets/images/parts/exterior.svg';
            } elseif ($businessType === 'tow_company') {
                $starterName = 'Standard Flatbed Towing Service (سطحة داخل المدينة)';
                $starterCategory = 'Towing & Recovery';
                $starterPrice = 120.00;
                $starterImg = 'assets/images/parts/exterior.svg';
            }

            $prodStmt = $db->prepare("INSERT INTO products (
                id, tenant_id, name, brand_name, oem_part_number, price, category, 
                description, compatibility, status, image, rating, featured, stock_quantity
            ) VALUES (
                :id, :tenant_id, :name, 'Universal', 'START-001', :price, :category,
                'Initial starter listing auto-generated for new vendor space.', '[\"Universal\"]', 'active', :image, 5.00, 1, 10
            )");
            $prodStmt->execute([
                ':id' => 'p-' . uniqid(),
                ':tenant_id' => $tenantId,
                ':name' => $starterName,
                ':price' => $starterPrice,
                ':category' => $starterCategory,
                ':image' => $starterImg,
            ]);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Vendor registered successfully',
                'tenant' => [
                    'id' => $tenantId,
                    'name' => $name,
                    'subdomain' => $subdomain,
                    'commission_rate' => $commRate
                ]
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
