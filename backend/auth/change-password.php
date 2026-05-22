<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');
$user = requireAuth();
$input = getJsonInput();

$currentPassword = $input['current_password'] ?? '';
$newPassword = $input['new_password'] ?? '';

if (!isValidPassword($currentPassword)) {
    sendError('Introduce tu contraseña actual', 400);
}

if (!isValidPassword($newPassword)) {
    sendError('La nueva contraseña debe tener al menos 6 caracteres', 400);
}

if ($currentPassword === $newPassword) {
    sendError('La nueva contraseña debe ser distinta de la actual', 400);
}

$stmt = $conn->prepare('SELECT id, password FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$user['id']]);
$storedUser = $stmt->fetch();

if (!$storedUser || !verifyPassword($currentPassword, $storedUser['password'])) {
    sendError('La contraseña actual no es correcta', 401);
}

$stmt = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
$stmt->execute([hashPassword($newPassword), $user['id']]);

sendSuccess(null, 'Contraseña actualizada correctamente');
