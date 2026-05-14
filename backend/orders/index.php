<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('GET');
$user = requireRole('admin');

$page = getOrQuery('page', 1);
$limit = getOrQuery('limit', 20);
$offset = ($page - 1) * $limit;

// Contar órdenes
$stmt = $conn->prepare('SELECT COUNT(*) as total FROM orders');
$stmt->execute();
$total = $stmt->fetch()['total'];

// Obtener órdenes
$stmt = $conn->prepare('
    SELECT o.*, u.email AS user_email, u.name AS user_name, o.coupon_code AS discount_code
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
');
$stmt->execute([$limit, $offset]);
$orders = $stmt->fetchAll();

// Obtener items para cada orden
foreach ($orders as &$order) {
    $stmt = $conn->prepare('
        SELECT oi.id, oi.course_id, c.title, c.slug, oi.price_at_purchase AS price
        FROM order_items oi
        JOIN courses c ON oi.course_id = c.id
        WHERE oi.order_id = ?
    ');
    $stmt->execute([$order['id']]);
    $order['items'] = $stmt->fetchAll();
}

sendSuccess([
    'orders' => $orders,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => ceil($total / $limit)
], 'All orders retrieved');
