<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');
$user = requireAdminOrEditor();

$input = getJsonInput();

// Validar campos
$errors = validateRequired($input, [
    'title' => 'Título',
    'description' => 'Descripción',
    'price' => 'Precio',
    'level' => 'Nivel',
    'category_id' => 'Categoría',
]);

if (!empty($errors)) {
    sendError('Validation failed', 400, $errors);
}

$title = sanitizeString($input['title']);
$description = sanitizeString($input['description']);
$price = (float) $input['price'];
$level = sanitizeString($input['level']);
$category_id = (int) $input['category_id'];
$slug = generateSlug($title);

if ($price < 0) {
    sendError('El precio no puede ser negativo', 400);
}

// Verificar que la categoría existe
$stmt = $conn->prepare('SELECT id FROM categories WHERE id = ?');
$stmt->execute([$category_id]);
if (!$stmt->fetch()) {
    sendError('Categoría no encontrada', 404);
}

try {
    $stmt = $conn->prepare('
        INSERT INTO courses (title, description, price, level, category_id, slug, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ');
    $stmt->execute([$title, $description, $price, $level, $category_id, $slug, $user['id']]);

    $courseId = $conn->lastInsertId();

    // Obtener curso creado
    $stmt = $conn->prepare('SELECT c.*, cat.name as category_name FROM courses c JOIN categories cat ON c.category_id = cat.id WHERE c.id = ?');
    $stmt->execute([$courseId]);
    $course = $stmt->fetch();

    sendSuccess($course, 'Curso creado correctamente', 201);
} catch (PDOException $e) {
    sendError('Error al crear curso', 500, $e->getMessage());
}
