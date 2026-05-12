<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethods(['POST', 'PUT']);
$user = requireAdminOrEditor();

$input = getJsonInput();
$courseId = $input['id'] ?? null;

if (!$courseId) {
    sendError('id es requerido', 400);
}

// Verificar que el curso existe
$stmt = $conn->prepare('SELECT id FROM courses WHERE id = ?');
$stmt->execute([$courseId]);
if (!$stmt->fetch()) {
    sendError('Curso no encontrado', 404);
}

// Preparar actualizaciones
$updates = [];
$params = [];

if (isset($input['title'])) {
    $updates[] = 'title = ?';
    $params[] = sanitizeString($input['title']);
}

if (isset($input['description'])) {
    $updates[] = 'description = ?';
    $params[] = sanitizeString($input['description']);
}

if (isset($input['price'])) {
    $price = (float) $input['price'];
    if ($price < 0) {
        sendError('El precio no puede ser negativo', 400);
    }
    $updates[] = 'price = ?';
    $params[] = $price;
}

if (isset($input['level'])) {
    $updates[] = 'level = ?';
    $params[] = sanitizeString($input['level']);
}

if (isset($input['category_id'])) {
    // Verificar categoría
    $stmt = $conn->prepare('SELECT id FROM categories WHERE id = ?');
    $stmt->execute([$input['category_id']]);
    if (!$stmt->fetch()) {
        sendError('Categoría no encontrada', 404);
    }
    $updates[] = 'category_id = ?';
    $params[] = (int) $input['category_id'];
}

if (empty($updates)) {
    sendError('No hay campos para actualizar', 400);
}

try {
    $sql = 'UPDATE courses SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $params[] = $courseId;

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    // Obtener curso actualizado
    $stmt = $conn->prepare('SELECT c.*, cat.name as category_name FROM courses c JOIN categories cat ON c.category_id = cat.id WHERE c.id = ?');
    $stmt->execute([$courseId]);
    $course = $stmt->fetch();

    sendSuccess($course, 'Curso actualizado correctamente');
} catch (PDOException $e) {
    sendError('Error al actualizar curso', 500, $e->getMessage());
}
