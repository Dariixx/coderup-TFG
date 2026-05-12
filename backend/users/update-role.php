<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validators.php';

requireMethods(['POST', 'PUT']);
$user = requireRole('admin');

$input = getJsonInput();

$userId = $input['user_id'] ?? null;
$role = $input['role'] ?? null;

if (!$userId || !$role) {
    sendError('user_id y role son requeridos', 400);
}

$validRoles = ['admin', 'editor', 'client', 'guest'];
if (!in_array($role, $validRoles)) {
    sendError('Rol inválido', 400);
}

// Verificar que el usuario existe
$stmt = $conn->prepare('SELECT id FROM users WHERE id = ?');
$stmt->execute([$userId]);
if (!$stmt->fetch()) {
    sendError('Usuario no encontrado', 404);
}

try {
    $stmt = $conn->prepare('UPDATE users SET role = ? WHERE id = ?');
    $stmt->execute([$role, $userId]);

    // Obtener usuario actualizado
    $stmt = $conn->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $updatedUser = $stmt->fetch();

    sendSuccess($updatedUser, 'Rol de usuario actualizado correctamente');
} catch (PDOException $e) {
    sendError('Error al actualizar usuario', 500, $e->getMessage());
}
