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
$sql = 'SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.description as category_description,
        u.name AS instructor_name, i.slug AS instructor_slug, i.bio AS instructor_bio,
        i.avatar_url AS instructor_avatar_url, i.specialty AS instructor_specialty,
        i.linkedin_url AS instructor_linkedin_url, i.github_url AS instructor_github_url,
        i.twitter_url AS instructor_twitter_url, i.years_experience AS instructor_years_experience,
        i.total_students AS instructor_total_students, i.rating AS instructor_rating
        FROM courses c
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE 1=1';
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
$countSql = 'SELECT COUNT(*) as total FROM courses c JOIN categories cat ON c.category_id = cat.id LEFT JOIN instructors i ON c.instructor_id = i.id LEFT JOIN users u ON i.user_id = u.id WHERE 1=1';
if ($category) {
    $countSql .= ' AND cat.slug = ?';
}
if ($level) {
    $countSql .= ' AND c.level = ?';
}
if ($search) {
    $countSql .= ' AND (c.title LIKE ? OR c.description LIKE ?)';
}
$countStmt = $conn->prepare($countSql);
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
