<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/catalog.php';

requireMethod('GET');

$id = getOrQuery('id');
$slug = getOrQuery('slug');

if (!$id && !$slug) {
    sendError('id o slug es requerido', 400);
}

$where = $id ? 'c.id = ?' : 'c.slug = ?';
$stmt = $conn->prepare(courseSelectSql() . " WHERE {$where} AND c.is_published = 1 LIMIT 1");
$stmt->execute([$id ?: $slug]);
$course = $stmt->fetch();

if (!$course) {
    sendError('Curso no encontrado', 404);
}

sendSuccess(formatCourse($course), 'Course retrieved');
