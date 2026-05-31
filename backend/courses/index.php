<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/catalog.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('GET');

$includeAll = getOrQuery('all') === '1' || getOrQuery('include_unpublished') === '1';
$category = getOrQuery('category');
$level = getOrQuery('level');
$search = getOrQuery('search');
$page = max(1, (int) getOrQuery('page', 1));
$limit = min(50, max(1, (int) getOrQuery('limit', 12)));
$offset = ($page - 1) * $limit;

$where = [];
$params = [];

if ($includeAll) {
    requireAdminOrEditor();
} else {
    $where[] = 'c.is_published = 1';
}

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

$whereSql = count($where) ? implode(' AND ', $where) : '1 = 1';

$countSql = '
    SELECT COUNT(*) AS total
    FROM courses c
    JOIN categories cat ON c.category_id = cat.id
    JOIN instructors i ON c.instructor_id = i.id
    WHERE ' . $whereSql;
$countStmt = $conn->prepare($countSql);
$countStmt->execute($params);
$total = (int) $countStmt->fetch()['total'];

$stmt = $conn->prepare(courseSelectSql() . " WHERE {$whereSql} ORDER BY c.created_at DESC LIMIT {$limit} OFFSET {$offset}");
$stmt->execute($params);
$courses = array_map('formatCourse', $stmt->fetchAll());

sendJson([
    'ok' => true,
    'data' => $courses,
    'message' => 'Courses retrieved',
    'error' => null,
    'pagination' => [
        'page' => $page,
        'total' => $total,
        'pages' => (int) ceil($total / $limit),
        'limit' => $limit,
    ],
]);
