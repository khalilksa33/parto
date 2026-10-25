<?php
/**
 * PARTO API - Tashleeh (Scrapyard) Part Requests & Live Quotes
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $tenantId = $_GET['tenant_id'] ?? null;

            if ($id) {
                // Get specific request + quotes
                $stmt = $db->prepare("SELECT * FROM part_requests WHERE id = :id LIMIT 1");
                $stmt->execute([':id' => $id]);
                $req = $stmt->fetch();

                if (!$req) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Part request not found']);
                    exit;
                }

                $qStmt = $db->prepare("SELECT pq.*, t.name as tenant_name, t.phone as tenant_phone, t.logo as tenant_logo 
                                       FROM part_quotes pq 
                                       LEFT JOIN tenants t ON pq.tenant_id = t.id 
                                       WHERE pq.request_id = :req_id 
                                       ORDER BY pq.created_at DESC");
                $qStmt->execute([':req_id' => $id]);
                $quotes = $qStmt->fetchAll();

                echo json_encode(['success' => true, 'request' => $req, 'quotes' => $quotes]);
                exit;
            }

            if ($tenantId) {
                // Get all pending requests for scrapyards to quote
                $rStmt = $db->query("SELECT * FROM part_requests WHERE status IN ('pending', 'quoted') ORDER BY created_at DESC LIMIT 50");
                $requests = $rStmt->fetchAll();

                // Get quotes submitted by this tenant
                $mqStmt = $db->prepare("SELECT * FROM part_quotes WHERE tenant_id = :tenant_id ORDER BY created_at DESC");
                $mqStmt->execute([':tenant_id' => $tenantId]);
                $myQuotes = $mqStmt->fetchAll();

                echo json_encode(['success' => true, 'requests' => $requests, 'myQuotes' => $myQuotes]);
                exit;
            }

            $allStmt = $db->query("SELECT * FROM part_requests ORDER BY created_at DESC LIMIT 50");
            echo json_encode(['success' => true, 'requests' => $allStmt->fetchAll()]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $action = $input['action'] ?? $_GET['action'] ?? 'request';

            if ($action === 'quote') {
                // Vendor submits quote
                $requestId = $input['requestId'] ?? $input['request_id'] ?? null;
                $tenantId = $input['tenantId'] ?? $input['tenant_id'] ?? null;
                $price = (float)($input['price'] ?? 0);
                $condition = $input['condition'] ?? 'Used - Grade A';
                $notes = $input['notes'] ?? '';

                if (!$requestId || !$tenantId || $price <= 0) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Valid request ID, tenant ID, and price are required']);
                    exit;
                }

                $quoteId = 'q-' . uniqid();
                $qStmt = $db->prepare("INSERT INTO part_quotes (id, request_id, tenant_id, price, condition_state, notes, status) 
                                       VALUES (:id, :request_id, :tenant_id, :price, :condition, :notes, 'pending')");
                $qStmt->execute([
                    ':id' => $quoteId,
                    ':request_id' => $requestId,
                    ':tenant_id' => $tenantId,
                    ':price' => $price,
                    ':condition' => $condition,
                    ':notes' => $notes
                ]);

                // Update request status to 'quoted'
                $db->prepare("UPDATE part_requests SET status = 'quoted' WHERE id = :id")->execute([':id' => $requestId]);

                http_response_code(201);
                echo json_encode(['success' => true, 'quote_id' => $quoteId, 'message' => 'Quote submitted successfully']);
                exit;
            }

            // Customer submits request
            $customerName = trim($input['customerName'] ?? $input['customer_name'] ?? '');
            $customerPhone = trim($input['customerPhone'] ?? $input['customer_phone'] ?? '');
            $vehicleMake = trim($input['vehicleMake'] ?? $input['vehicle_make'] ?? '');
            $vehicleModel = trim($input['vehicleModel'] ?? $input['vehicle_model'] ?? '');
            $vehicleYear = trim($input['vehicleYear'] ?? $input['vehicle_year'] ?? '');
            $partName = trim($input['partName'] ?? $input['part_name'] ?? '');
            $vin = trim($input['vin'] ?? '');
            $notes = trim($input['notes'] ?? '');

            if (empty($customerName) || empty($customerPhone) || empty($vehicleMake) || empty($partName)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Please provide customer name, phone, vehicle make, and part name.']);
                exit;
            }

            $requestId = 'req-' . uniqid();
            $stmt = $db->prepare("INSERT INTO part_requests (
                id, customer_name, customer_phone, vehicle_make, vehicle_model, vehicle_year, part_name, vin, notes, status
            ) VALUES (
                :id, :name, :phone, :make, :model, :year, :part, :vin, :notes, 'pending'
            )");

            $stmt->execute([
                ':id' => $requestId,
                ':name' => $customerName,
                ':phone' => $customerPhone,
                ':make' => $vehicleMake,
                ':model' => $vehicleModel,
                ':year' => $vehicleYear,
                ':part' => $partName,
                ':vin' => $vin,
                ':notes' => $notes
            ]);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'request' => [
                    'id' => $requestId,
                    'customerName' => $customerName,
                    'partName' => $partName,
                    'status' => 'pending'
                ]
            ]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents('php://input'), true);
            $quoteId = $_GET['id'] ?? $input['quote_id'] ?? null;
            $requestId = $input['requestId'] ?? $input['request_id'] ?? null;

            if (!$quoteId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Quote ID required']);
                exit;
            }

            // Accept quote
            $db->prepare("UPDATE part_quotes SET status = 'accepted' WHERE id = :id")->execute([':id' => $quoteId]);
            if ($requestId) {
                $db->prepare("UPDATE part_requests SET status = 'accepted' WHERE id = :id")->execute([':id' => $requestId]);
            }

            echo json_encode(['success' => true, 'message' => 'Quote accepted successfully! Vendor notified.']);
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
