<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');
ensureAuthTables($conn);
ensurePasswordResetColumns($conn);

$input = getJsonInput();
$token = trim((string)($input['token'] ?? ''));
$password = (string)($input['password'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    sendError('Token inválido', 400);
}

if (!isValidPassword($password)) {
    sendError('La contraseña debe tener al menos 6 caracteres', 400);
}

$stmt = $conn->prepare('
    SELECT id FROM users
    WHERE reset_token = ?
      AND reset_token_expires_at IS NOT NULL
      AND reset_token_expires_at > NOW()
    LIMIT 1
');
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    sendError('El enlace ha caducado o no es válido', 400);
}

$stmt = $conn->prepare('
    UPDATE users
    SET password = ?, reset_token = NULL, reset_token_expires_at = NULL, remember_token = NULL
    WHERE id = ?
');
$stmt->execute([hashPassword($password), $user['id']]);

$stmt = $conn->prepare('SELECT password FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$user['id']]);
$updatedUser = $stmt->fetch();

if (!$updatedUser || !verifyPassword($password, $updatedUser['password'])) {
    sendError('No se ha podido actualizar la contraseña', 500);
}

sendSuccess(null, 'Contraseña actualizada correctamente.');
