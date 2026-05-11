<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('GET');
requireRole('admin');

try {
    $pdo = getPDO();
    $ordersQuery = $pdo->query('
        SELECT
            orders.id,
            orders.user_id,
            users.name AS user_name,
            users.email AS user_email,
            orders.total,
            orders.discount_code,
            orders.discount_amount,
            orders.status,
            orders.created_at
        FROM orders
        INNER JOIN users ON users.id = orders.user_id
        ORDER BY orders.created_at DESC
    ');
    $orders = $ordersQuery->fetchAll();

    foreach ($orders as &$order) {
        $itemsQuery = $pdo->prepare('
            SELECT order_items.id, order_items.course_id, order_items.price, courses.title, courses.slug
            FROM order_items
            INNER JOIN courses ON courses.id = order_items.course_id
            WHERE order_items.order_id = :order_id
            ORDER BY order_items.id ASC
        ');
        $itemsQuery->execute(['order_id' => $order['id']]);
        $order['items'] = $itemsQuery->fetchAll();
    }
    unset($order);

    jsonResponse(true, 'Listado de pedidos recuperado correctamente.', ['orders' => $orders]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Orders index error: ' . $exception->getMessage());
    jsonResponse(false, 'No se han podido recuperar los pedidos.', null, 500);
}
