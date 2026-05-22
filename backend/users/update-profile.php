<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethods(['POST', 'PUT']);
$user = requireAuth();
$input = getJsonInput();

$name = sanitizeString($input['name'] ?? '');
$email = sanitizeEmail($input['email'] ?? '');

if (strlen($name) < 2) {
    sendError('El nombre debe tener al menos 2 caracteres', 400);
}

if (!isValidEmail($email)) {
    sendError('Email inválido', 400);
}

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
$stmt->execute([$email, $user['id']]);
if ($stmt->fetch()) {
    sendError('Ya existe una cuenta con este email', 409);
}

$stmt = $conn->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
$stmt->execute([$name, $email, $user['id']]);

$stmt = $conn->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
$stmt->execute([$user['id']]);

sendSuccess($stmt->fetch(), 'Perfil actualizado correctamente');
