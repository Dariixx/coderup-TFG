<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

requireMethod('GET');

$slug = getOrQuery('slug');
$id = getOrQuery('id');

if (!$slug && !$id) {
    sendError('slug o id es requerido', 400);
}

$where = $slug ? 'i.slug = ?' : 'i.id = ?';
$stmt = $conn->prepare("
    SELECT i.*, u.name, u.email
    FROM instructors i
    JOIN users u ON u.id = i.user_id
    WHERE {$where}
    LIMIT 1
");
$stmt->execute([$slug ?: $id]);
$instructor = $stmt->fetch();

if (!$instructor) {
    sendError('Instructor no encontrado', 404);
}

$stmt = $conn->prepare('
    SELECT c.*, cat.name AS category_name, cat.slug AS category_slug, cat.description AS category_description,
           u.name AS instructor_name, i.slug AS instructor_slug, i.bio AS instructor_bio,
           i.avatar_url AS instructor_avatar_url, i.specialty AS instructor_specialty,
           i.linkedin_url AS instructor_linkedin_url, i.github_url AS instructor_github_url,
           i.twitter_url AS instructor_twitter_url, i.years_experience AS instructor_years_experience,
           i.total_students AS instructor_total_students, i.rating AS instructor_rating
    FROM courses c
    JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN instructors i ON c.instructor_id = i.id
    LEFT JOIN users u ON i.user_id = u.id
    WHERE c.instructor_id = ?
    ORDER BY c.created_at DESC
');
$stmt->execute([$instructor['id']]);

sendSuccess([
    'instructor' => $instructor,
    'courses' => $stmt->fetchAll(),
], 'Instructor retrieved');

