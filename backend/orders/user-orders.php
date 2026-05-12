<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('GET');
$user = requireAuth();

$page = getOrQuery('page', 1);
$limit = getOrQuery('limit', 10);
$offset = ($page - 1) * $limit;

// Contar órdenes del usuario
$stmt = $conn->prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?');
$stmt->execute([$user['id']]);
$total = $stmt->fetch()['total'];

// Obtener órdenes del usuario
$stmt = $conn->prepare('
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
');
$stmt->execute([$user['id'], $limit, $offset]);
$orders = $stmt->fetchAll();

// Obtener items para cada orden
foreach ($orders as &$order) {
    $stmt = $conn->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $stmt->execute([$order['id']]);
    $order['items'] = $stmt->fetchAll();
}

sendSuccess([
    'orders' => $orders,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => ceil($total / $limit)
], 'User orders retrieved');
