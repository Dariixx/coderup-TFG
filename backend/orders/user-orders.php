<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('GET');
$user = requireAuth();

try {
    $pdo = getPDO();
    $ordersQuery = $pdo->prepare('
        SELECT id, user_id, total, discount_code, discount_amount, status, created_at
        FROM orders
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    ');
    $ordersQuery->execute(['user_id' => $user['id']]);
    $orders = $ordersQuery->fetchAll();

    foreach ($orders as &$order) {
        $itemsQuery = $pdo->prepare('
            SELECT order_items.id, order_items.course_id, order_items.price, order_items.created_at, courses.title, courses.slug
            FROM order_items
            INNER JOIN courses ON courses.id = order_items.course_id
            WHERE order_items.order_id = :order_id
            ORDER BY order_items.id ASC
        ');
        $itemsQuery->execute(['order_id' => $order['id']]);
        $order['items'] = $itemsQuery->fetchAll();
    }
    unset($order);

    jsonResponse(true, 'Pedidos del usuario recuperados correctamente.', ['orders' => $orders]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] User orders error: ' . $exception->getMessage());
    jsonResponse(false, 'No se han podido recuperar los pedidos del usuario.', null, 500);
}
