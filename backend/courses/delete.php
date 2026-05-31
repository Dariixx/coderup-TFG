<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
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
    $conn->beginTransaction();

    // Limpiar relaciones explícitas antes del curso. Algunas instalaciones antiguas
    // no tienen ON DELETE CASCADE en order_items y bloqueaban el borrado desde panel.
    $relatedTables = [
        'cart_items',
        'course_reviews',
        'enrollments',
        'order_items',
    ];

    foreach ($relatedTables as $table) {
        try {
            $stmt = $conn->prepare("DELETE FROM {$table} WHERE course_id = ?");
            $stmt->execute([$courseId]);
        } catch (PDOException $ignored) {
            // La tabla puede no existir en instalaciones parciales; no debe bloquear
            // la eliminación si la relación no está creada.
        }
    }

    $stmt = $conn->prepare('DELETE FROM courses WHERE id = ?');
    $stmt->execute([$courseId]);

    $conn->commit();

    sendSuccess(null, 'Curso eliminado correctamente');
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    sendError('Error al eliminar curso', 500, $e->getMessage());
}
