<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

requireMethod('GET');

$id = getOrQuery('id');
$slug = getOrQuery('slug');

if (!$id && !$slug) {
    sendError('id o slug es requerido', 400);
}

if ($id) {
    $stmt = $conn->prepare('SELECT c.*, cat.name as category_name FROM courses c JOIN categories cat ON c.category_id = cat.id WHERE c.id = ?');
    $stmt->execute([$id]);
} else {
    $stmt = $conn->prepare('SELECT c.*, cat.name as category_name FROM courses c JOIN categories cat ON c.category_id = cat.id WHERE c.slug = ?');
    $stmt->execute([$slug]);
}

$course = $stmt->fetch();

if (!$course) {
    sendError('Curso no encontrado', 404);
}

sendSuccess($course, 'Course retrieved');
