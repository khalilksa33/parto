<?php
/**
 * PARTO API - Orders & Checkout Endpoint
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            $orderNumber = $_GET['order_number'] ?? null;
            $tenantId = $_GET['tenant_id'] ?? null;
            $phone = $_GET['phone'] ?? null;

            if ($orderNumber) {
                $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = :order_number LIMIT 1");
                $stmt->execute([':order_number' => $orderNumber]);
                $order = $stmt->fetch();
                if (!$order) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Order not found']);
                    exit;
                }
                $order['items'] = json_decode($order['items_json'], true) ?: [];
                echo json_encode(['success' => true, 'order' => $order]);
                exit;
            }

            if ($tenantId) {
                $stmt = $db->prepare("SELECT * FROM orders WHERE tenant_id = :tenant_id ORDER BY created_at DESC LIMIT 100");
                $stmt->execute([':tenant_id' => $tenantId]);
                $orders = $stmt->fetchAll();
                foreach ($orders as &$ord) {
                    $ord['items'] = json_decode($ord['items_json'], true) ?: [];
                }
                echo json_encode(['success' => true, 'orders' => $orders]);
                exit;
            }

            // Super admin or customer lookup
            $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100");
            $orders = $stmt->fetchAll();
            foreach ($orders as &$ord) {
                $ord['items'] = json_decode($ord['items_json'], true) ?: [];
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            $customerName = trim($input['customer_name'] ?? '');
            $customerPhone = trim($input['customer_phone'] ?? '');
            $customerEmail = trim($input['customer_email'] ?? '');
            $deliveryCity = trim($input['delivery_city'] ?? 'Riyadh');
            $deliveryAddress = trim($input['delivery_address'] ?? '');
            $items = $input['items'] ?? [];
            $shippingProvider = $input['shipping_provider'] ?? 'SMSA Express';
            $paymentMethod = $input['payment_method'] ?? 'mada';
            $shippingFee = (float)($input['shipping_fee'] ?? 25.00);

            if (empty($customerName) || empty($customerPhone) || empty($deliveryAddress) || empty($items)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Please fill all required customer and delivery details, and ensure your cart has items.']);
                exit;
            }

            // Calculate subtotal
            $subtotal = 0;
            $primaryTenantId = null;
            foreach ($items as $item) {
                $qty = max(1, (int)($item['quantity'] ?? 1));
                $price = (float)($item['price'] ?? 0);
                $subtotal += ($price * $qty);
                $tenant = $item['tenant_id'] ?? $item['tenantId'] ?? null;
                if (!$primaryTenantId && !empty($tenant)) {
                    $primaryTenantId = $tenant;
                }
            }

            $totalAmount = $subtotal + $shippingFee;
            $orderNumber = 'PRT-' . strtoupper(substr(uniqid(), 7, 6));
            $orderId = 'ord-' . uniqid();

            $stmt = $db->prepare("INSERT INTO orders (
                id, tenant_id, order_number, customer_name, customer_phone, customer_email,
                delivery_city, delivery_address, total_amount, currency, shipping_provider, 
                shipping_fee, payment_method, payment_status, status, items_json
            ) VALUES (
                :id, :tenant_id, :order_number, :customer_name, :customer_phone, :customer_email,
                :delivery_city, :delivery_address, :total_amount, 'SAR', :shipping_provider,
                :shipping_fee, :payment_method, 'completed', 'pending', :items_json
            )");

            $stmt->execute([
                ':id' => $orderId,
                ':tenant_id' => $primaryTenantId ?: 't-riyadh-oem',
                ':order_number' => $orderNumber,
                ':customer_name' => $customerName,
                ':customer_phone' => $customerPhone,
                ':customer_email' => $customerEmail,
                ':delivery_city' => $deliveryCity,
                ':delivery_address' => $deliveryAddress,
                ':total_amount' => $totalAmount,
                ':shipping_provider' => $shippingProvider,
                ':shipping_fee' => $shippingFee,
                ':payment_method' => $paymentMethod,
                ':items_json' => json_encode($items, JSON_UNESCAPED_UNICODE)
            ]);

            // Add notification
            $notifStmt = $db->prepare("INSERT INTO notifications (id, recipient, title, message, link, is_read) VALUES (:id, 'all', :title, :message, :link, 0)");
            $notifStmt->execute([
                ':id' => 'notif-' . uniqid(),
                ':title' => "طلب جديد #{$orderNumber}",
                ':message' => "قام العميل {$customerName} بطلب قطع غيار بقيمة " . number_format($totalAmount, 2) . " ر.س",
                ':link' => "order-success.php?order=" . $orderNumber
            ]);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'message' => 'Order created successfully'
            ]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents('php://input'), true);
            $orderId = $_GET['id'] ?? $input['id'] ?? null;
            $newStatus = $input['status'] ?? null;

            if (!$orderId || !$newStatus) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Order ID and new status are required']);
                exit;
            }

            $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :id");
            $stmt->execute([':status' => $newStatus, ':id' => $orderId]);

            echo json_encode(['success' => true, 'message' => "Order status updated to {$newStatus}"]);
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
