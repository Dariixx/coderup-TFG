<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/catalog.php';

requireMethod('GET');

$slug = getOrQuery('slug');
$id = getOrQuery('id');

if (!$slug && !$id) {
    sendError('slug o id es requerido', 400);
}

$where = $slug ? 'p.slug = ?' : 'p.id = ?';
$stmt = $conn->prepare(postSelectSql() . " WHERE {$where} AND p.is_published = 1 LIMIT 1");
$stmt->execute([$slug ?: $id]);
$post = $stmt->fetch();

if (!$post) {
    sendError('Post no encontrado', 404);
}

sendSuccess(formatPost($post), 'Post retrieved');
