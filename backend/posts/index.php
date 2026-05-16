<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/catalog.php';

requireMethod('GET');

$category = getOrQuery('category');
$search = getOrQuery('search');
$page = max(1, (int) getOrQuery('page', 1));
$limit = min(50, max(1, (int) getOrQuery('limit', 10)));
$offset = ($page - 1) * $limit;

$where = ['p.is_published = 1'];
$params = [];

if ($category) {
    $where[] = 'p.category = ?';
    $params[] = $category;
}

if ($search) {
    $where[] = '(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)';
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$whereSql = implode(' AND ', $where);
$countSql = '
    SELECT COUNT(*) AS total
    FROM posts p
    JOIN instructors i ON p.author_id = i.id
    WHERE ' . $whereSql;
$countStmt = $conn->prepare($countSql);
$countStmt->execute($params);
$total = (int) $countStmt->fetch()['total'];

$stmt = $conn->prepare(postSelectSql() . " WHERE {$whereSql} ORDER BY p.published_at DESC LIMIT {$limit} OFFSET {$offset}");
$stmt->execute($params);

sendJson([
    'ok' => true,
    'data' => array_map('formatPost', $stmt->fetchAll()),
    'message' => 'Posts retrieved',
    'error' => null,
    'pagination' => [
        'page' => $page,
        'total' => $total,
        'pages' => (int) ceil($total / $limit),
        'limit' => $limit,
    ],
]);
