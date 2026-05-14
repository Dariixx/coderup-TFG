<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/catalog.php';

requireMethod('GET');

$category = getOrQuery('category');
$level = getOrQuery('level');
$search = getOrQuery('search');
$page = max(1, (int) getOrQuery('page', 1));
$limit = min(50, max(1, (int) getOrQuery('limit', 12)));
$offset = ($page - 1) * $limit;

$where = ['c.is_published = 1'];
$params = [];

if ($category) {
    $where[] = 'cat.slug = ?';
    $params[] = $category;
}

if ($level) {
    $where[] = 'LOWER(c.level) = LOWER(?)';
    $params[] = $level;
}

if ($search) {
    $where[] = '(c.title LIKE ? OR c.description LIKE ?)';
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$whereSql = implode(' AND ', $where);

$countStmt = $conn->prepare(courseSelectSql() . " WHERE {$whereSql}");
$countStmt->execute($params);
$total = count($countStmt->fetchAll());

$stmt = $conn->prepare(courseSelectSql() . " WHERE {$whereSql} ORDER BY c.created_at DESC LIMIT {$limit} OFFSET {$offset}");
$stmt->execute($params);
$courses = array_map('formatCourse', $stmt->fetchAll());

sendSuccess([
    'courses' => $courses,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => (int) ceil($total / $limit),
], 'Courses retrieved');
