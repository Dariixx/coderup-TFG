<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethods(['POST', 'DELETE']);
$user = requireAdminOrEditor();

$input = getJsonInput();
$courseId = $input['id'] ?? getOrQuery('id');

if (!$courseId) {
    sendError('id es requerido', 400);
}

// Verificar que el curso existe
$stmt = $conn->prepare('SELECT id FROM courses WHERE id = ?');
$stmt->execute([$courseId]);
if (!$stmt->fetch()) {
    sendError('Curso no encontrado', 404);
}

try {
    // Eliminar del carrito primero (si existiera relación)
    $stmt = $conn->prepare('DELETE FROM courses WHERE id = ?');
    $stmt->execute([$courseId]);

    sendSuccess(null, 'Curso eliminado correctamente');
} catch (PDOException $e) {
    sendError('Error al eliminar curso', 500, $e->getMessage());
}
