<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

requireMethod('GET');

$category = getOrQuery('category');
$search = getOrQuery('search');

$sql = '
    SELECT p.*, u.name AS author_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.is_published = 1
';
$params = [];

if ($category) {
    $sql .= ' AND p.category = ?';
    $params[] = $category;
}

if ($search) {
    $sql .= ' AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)';
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$sql .= ' ORDER BY p.published_at DESC';
$stmt = $conn->prepare($sql);
$stmt->execute($params);

sendSuccess(['posts' => $stmt->fetchAll()], 'Posts retrieved');

