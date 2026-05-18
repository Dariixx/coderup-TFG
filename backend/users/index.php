<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('GET');
$user = requireRole('admin');
ensureRolesTable($conn);

$page = getOrQuery('page', 1);
$limit = getOrQuery('limit', 20);
$offset = ($page - 1) * $limit;

// Contar usuarios
$stmt = $conn->prepare('SELECT COUNT(*) as total FROM users');
$stmt->execute();
$total = $stmt->fetch()['total'];

// Obtener usuarios
$stmt = $conn->prepare('
    SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        COALESCE(r.id, CASE u.role
            WHEN "admin" THEN 1
            WHEN "editor" THEN 2
            WHEN "client" THEN 3
            WHEN "guest" THEN 4
            ELSE 3
        END) AS role_id,
        u.created_at
    FROM users u
    LEFT JOIN roles r ON r.name = u.role
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
');
$stmt->execute([$limit, $offset]);
$users = $stmt->fetchAll();

sendSuccess([
    'users' => $users,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => ceil($total / $limit)
], 'Users retrieved');
