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

// Contar usuarios
$stmt = $conn->prepare('SELECT COUNT(*) as total FROM users');
$stmt->execute();
$total = $stmt->fetch()['total'];

// Obtener usuarios
$stmt = $conn->prepare('
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
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
