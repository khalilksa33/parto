<?php
/**
 * PARTO API - Products Catalog Endpoint
 * CRUD operations, search, category & brand filtering
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            $tenantId = $_GET['tenant_id'] ?? $_GET['tenantId'] ?? null;
            $brand = $_GET['brand'] ?? null;
            $category = $_GET['category'] ?? null;
            $search = $_GET['q'] ?? $_GET['search'] ?? null;
            $featured = isset($_GET['featured']) ? (int)$_GET['featured'] : null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

            $conditions = ["p.status = 'active'"];
            $params = [];

            if ($tenantId && $tenantId !== 'all') {
                $conditions[] = "tenant_id = :tenant_id";
                $params[':tenant_id'] = $tenantId;
            }

            if ($brand && $brand !== 'all') {
                $conditions[] = "(LOWER(brand_name) = LOWER(:brand) OR LOWER(compatibility) LIKE LOWER(:brand_like))";
                $params[':brand'] = $brand;
                $params[':brand_like'] = "%\"{$brand}\"%";
            }

            if ($category && $category !== 'all') {
                $conditions[] = "category = :category";
                $params[':category'] = $category;
            }

            if ($search) {
                $conditions[] = "(name LIKE :search OR description LIKE :search OR oem_part_number LIKE :search OR brand_name LIKE :search)";
                $params[':search'] = "%{$search}%";
            }

            if ($featured !== null) {
                $conditions[] = "featured = :featured";
                $params[':featured'] = $featured;
            }

            $sql = "SELECT p.*, t.name as tenant_name, t.subdomain as tenant_subdomain, t.logo as tenant_logo 
                    FROM products p 
                    LEFT JOIN tenants t ON p.tenant_id = t.id 
                    WHERE " . implode(' AND ', $conditions) . " 
                    ORDER BY p.featured DESC, p.created_at DESC 
                    LIMIT " . (int)$limit;

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll();

            // Decode compatibility JSON
            foreach ($products as &$p) {
                $p['compatibility'] = !empty($p['compatibility']) ? json_decode($p['compatibility'], true) : [];
                $p['featured'] = (bool)$p['featured'];
                $p['price'] = (float)$p['price'];
                $p['rating'] = (float)$p['rating'];
            }

            echo json_encode(['success' => true, 'count' => count($products), 'products' => $products]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            
            if (empty($input['name']) || empty($input['tenant_id']) || !isset($input['price'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing required fields (name, tenant_id, price)']);
                exit;
            }

            $id = 'p-' . uniqid();
            $stmt = $db->prepare("INSERT INTO products (
                id, tenant_id, name, brand_name, oem_part_number, price, category, 
                description, compatibility, status, image, rating, featured, weight, length, width, height, stock_quantity
            ) VALUES (
                :id, :tenant_id, :name, :brand_name, :oem_part_number, :price, :category,
                :description, :compatibility, 'active', :image, 4.90, :featured, :weight, :length, :width, :height, :stock_quantity
            )");

            $compatibility = is_array($input['compatibility'] ?? null) 
                ? json_encode($input['compatibility']) 
                : json_encode(array_filter(array_map('trim', explode(',', $input['compatibility'] ?? ''))));

            $image = !empty($input['image']) ? $input['image'] : 'assets/images/parts/engine.svg';

            $stmt->execute([
                ':id' => $id,
                ':tenant_id' => $input['tenant_id'],
                ':name' => $input['name'],
                ':brand_name' => $input['brand_name'] ?? 'Universal',
                ':oem_part_number' => $input['oem_part_number'] ?? null,
                ':price' => (float)$input['price'],
                ':category' => $input['category'] ?? 'Engine Parts',
                ':description' => $input['description'] ?? '',
                ':compatibility' => $compatibility,
                ':image' => $image,
                ':featured' => !empty($input['featured']) ? 1 : 0,
                ':weight' => (float)($input['weight'] ?? 1.5),
                ':length' => (float)($input['length'] ?? 20),
                ':width' => (float)($input['width'] ?? 15),
                ':height' => (float)($input['height'] ?? 10),
                ':stock_quantity' => (int)($input['stock_quantity'] ?? 10),
            ]);

            http_response_code(201);
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Product created successfully']);
            break;

        case 'PATCH':
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Product ID is required']);
                exit;
            }

            $fields = [];
            $params = [':id' => $id];

            if (isset($input['price'])) {
                $fields[] = "price = :price";
                $params[':price'] = (float)$input['price'];
            }
            if (isset($input['stock_quantity'])) {
                $fields[] = "stock_quantity = :stock_quantity";
                $params[':stock_quantity'] = (int)$input['stock_quantity'];
            }
            if (isset($input['featured'])) {
                $fields[] = "featured = :featured";
                $params[':featured'] = $input['featured'] ? 1 : 0;
            }
            if (isset($input['name'])) {
                $fields[] = "name = :name";
                $params[':name'] = $input['name'];
            }

            if (empty($fields)) {
                echo json_encode(['success' => true, 'message' => 'Nothing to update']);
                exit;
            }

            $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Product ID required']);
                exit;
            }
            $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
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
