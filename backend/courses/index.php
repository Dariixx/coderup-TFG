<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

requireMethod('GET');

// Parámetros opcionales
$category = getOrQuery('category');
$level = getOrQuery('level');
$search = getOrQuery('search');
$page = getOrQuery('page', 1);
$limit = getOrQuery('limit', 12);

$offset = ($page - 1) * $limit;

// Construir query base
$sql = 'SELECT c.*, cat.name as category_name FROM courses c JOIN categories cat ON c.category_id = cat.id WHERE 1=1';
$params = [];

if ($category) {
    $sql .= ' AND cat.slug = ?';
    $params[] = $category;
}

if ($level) {
    $sql .= ' AND c.level = ?';
    $params[] = $level;
}

if ($search) {
    $sql .= ' AND (c.title LIKE ? OR c.description LIKE ?)';
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

// Contar total
$countStmt = $conn->prepare(str_replace('SELECT c.*', 'SELECT COUNT(*) as total', $sql));
$countStmt->execute($params);
$total = $countStmt->fetch()['total'];

// Obtener resultados
$sql .= ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
$params[] = $limit;
$params[] = $offset;

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$courses = $stmt->fetchAll();

sendSuccess([
    'courses' => $courses,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => ceil($total / $limit)
], 'Courses retrieved');
