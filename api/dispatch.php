<?php
/**
 * PARTO API - Towing & Mobile Workshop Dispatch Endpoint
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            $dispatchId = $_GET['id'] ?? null;
            $serviceType = $_GET['service_type'] ?? null;

            if ($dispatchId) {
                $stmt = $db->prepare("SELECT d.*, t.name as driver_name, t.phone as driver_phone, t.logo as driver_logo 
                                       FROM dispatches d 
                                       LEFT JOIN tenants t ON d.accepted_by = t.id 
                                       WHERE d.id = :id LIMIT 1");
                $stmt->execute([':id' => $dispatchId]);
                $dispatch = $stmt->fetch();

                if (!$dispatch) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Dispatch not found']);
                    exit;
                }

                // Auto-advance status in demo mode after 10-20 seconds to give real interactive feeling
                $createdTimestamp = strtotime($dispatch['created_at']);
                $elapsed = time() - $createdTimestamp;
                $currentStatus = $dispatch['status'];

                if ($currentStatus === 'pending' && $elapsed > 8) {
                    $newStatus = 'accepted';
                    $acceptedBy = 't-najm-satha';
                    $db->prepare("UPDATE dispatches SET status = :st, accepted_by = :acc WHERE id = :id")->execute([':st' => $newStatus, ':acc' => $acceptedBy, ':id' => $dispatchId]);
                    $dispatch['status'] = $newStatus;
                    $dispatch['driver_name'] = 'Najm Express Towing & Satha';
                    $dispatch['driver_phone'] = '+966 58 776 5544';
                } elseif ($currentStatus === 'accepted' && $elapsed > 18) {
                    $newStatus = 'en_route';
                    $db->prepare("UPDATE dispatches SET status = :st WHERE id = :id")->execute([':st' => $newStatus, ':id' => $dispatchId]);
                    $dispatch['status'] = $newStatus;
                }

                echo json_encode(['success' => true, 'dispatch' => $dispatch]);
                exit;
            }

            // Return active dispatches
            $sql = "SELECT * FROM dispatches ORDER BY created_at DESC LIMIT 50";
            echo json_encode(['success' => true, 'dispatches' => $db->query($sql)->fetchAll()]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            $customerName = trim($input['customerName'] ?? $input['customer_name'] ?? '');
            $customerPhone = trim($input['customerPhone'] ?? $input['customer_phone'] ?? '');
            $pickupLocation = trim($input['pickupLocation'] ?? $input['pickup_location'] ?? '');
            $dropoffLocation = trim($input['dropoffLocation'] ?? $input['dropoff_location'] ?? '');
            $vehicleDetails = trim($input['vehicleDetails'] ?? $input['vehicle_details'] ?? '');
            $serviceType = $input['serviceType'] ?? $input['service_type'] ?? 'tow';

            if (empty($customerName) || empty($customerPhone) || empty($pickupLocation)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Please provide customer name, phone, and pickup location']);
                exit;
            }

            $dispatchId = 'dsp-' . uniqid();
            $stmt = $db->prepare("INSERT INTO dispatches (
                id, service_type, customer_name, customer_phone, pickup_location, dropoff_location, vehicle_details, status
            ) VALUES (
                :id, :service_type, :name, :phone, :pickup, :dropoff, :vehicle, 'pending'
            )");

            $stmt->execute([
                ':id' => $dispatchId,
                ':service_type' => $serviceType,
                ':name' => $customerName,
                ':phone' => $customerPhone,
                ':pickup' => $pickupLocation,
                ':dropoff' => $dropoffLocation ?: 'Nearest Authorized Workshop',
                ':vehicle' => $vehicleDetails,
            ]);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'dispatch' => [
                    'id' => $dispatchId,
                    'service_type' => $serviceType,
                    'status' => 'pending'
                ]
            ]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents('php://input'), true);
            $dispatchId = $_GET['id'] ?? $input['id'] ?? null;
            $status = $input['status'] ?? null;
            $acceptedBy = $input['accepted_by'] ?? null;

            if (!$dispatchId || !$status) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing ID or status']);
                exit;
            }

            $stmt = $db->prepare("UPDATE dispatches SET status = :status, accepted_by = COALESCE(:acc, accepted_by) WHERE id = :id");
            $stmt->execute([':status' => $status, ':acc' => $acceptedBy, ':id' => $dispatchId]);

            echo json_encode(['success' => true, 'message' => "Dispatch status updated to {$status}"]);
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
