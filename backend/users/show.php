<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('GET');
requireAuth();

$userId = getOrQuery('id');

if (!$userId) {
    sendError('id es requerido', 400);
}

$stmt = $conn->prepare('
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = ?
');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    sendError('Usuario no encontrado', 404);
}

sendSuccess($user, 'User retrieved');
