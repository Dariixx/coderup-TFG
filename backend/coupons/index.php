<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/coupons.php';

requireMethod('GET');

$user = requireAuth();
ensureDefaultCoupons($conn);

$role = $user['role'] ?? 'guest';

$where = 'active = 1 AND (expires_at IS NULL OR expires_at > NOW())';
$params = [];

if ($role !== 'admin') {
    $allowedByRole = [
        'editor' => ['EDITOR15', 'SUMMER10'],
        'client' => ['WELCOME20', 'SUMMER10', 'BUY3', 'BUY5'],
        'guest' => [],
    ];

    $allowed = $allowedByRole[$role] ?? [];
    if (empty($allowed)) {
        sendSuccess(['coupons' => []], 'Cupones disponibles');
    }

    $placeholders = implode(',', array_fill(0, count($allowed), '?'));
    $where .= " AND code IN ({$placeholders})";
    $params = $allowed;
}

$stmt = $conn->prepare("
    SELECT id, code, description, discount_type, discount_value, min_items, max_items, max_uses, uses, only_new_users, active, expires_at
    FROM coupons
    WHERE {$where}
    ORDER BY discount_value DESC, code ASC
");
$stmt->execute($params);

sendSuccess(['coupons' => $stmt->fetchAll()], 'Cupones disponibles');
