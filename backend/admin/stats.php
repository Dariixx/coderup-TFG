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

    $userCount = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $courseCount = (int) $pdo->query('SELECT COUNT(*) FROM courses')->fetchColumn();
    $orderCount = (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    $totalRevenue = (float) $pdo->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed'")->fetchColumn();

    $latestOrdersQuery = $pdo->query('
        SELECT orders.id, orders.total, orders.status, orders.created_at, users.name AS user_name, users.email AS user_email
        FROM orders
        INNER JOIN users ON users.id = orders.user_id
        ORDER BY orders.created_at DESC
        LIMIT 5
    ');

    jsonResponse(true, 'Resumen del panel recuperado correctamente.', [
        'stats' => [
            'users' => $userCount,
            'courses' => $courseCount,
            'orders' => $orderCount,
            'total_revenue' => round($totalRevenue, 2),
            'latest_orders' => $latestOrdersQuery->fetchAll(),
        ],
    ]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Admin stats error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido recuperar el panel de administración.', null, 500);
}
