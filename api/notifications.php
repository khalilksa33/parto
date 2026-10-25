<?php
/**
 * PARTO API - Real-time Notifications Endpoint
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            $recipient = $_GET['recipient'] ?? 'all';
            $stmt = $db->prepare("SELECT * FROM notifications WHERE recipient IN (:rec, 'all') ORDER BY created_at DESC LIMIT 20");
            $stmt->execute([':rec' => $recipient]);
            $notifications = $stmt->fetchAll();

            $unreadCount = 0;
            foreach ($notifications as $n) {
                if (!$n['is_read']) $unreadCount++;
            }

            echo json_encode(['success' => true, 'unread_count' => $unreadCount, 'notifications' => $notifications]);
            break;

        case 'POST':
        case 'PATCH':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $id = $input['id'] ?? $_GET['id'] ?? null;
            $markAll = $input['mark_all'] ?? false;

            if ($markAll) {
                $db->query("UPDATE notifications SET is_read = 1");
                echo json_encode(['success' => true, 'message' => 'All notifications marked as read']);
                exit;
            }

            if ($id) {
                $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
                exit;
            }

            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing ID or mark_all parameter']);
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
