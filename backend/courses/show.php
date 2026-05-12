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
    $stmt = $conn->prepare('
        SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.description as category_description,
               u.name AS instructor_name, i.slug AS instructor_slug, i.bio AS instructor_bio,
               i.avatar_url AS instructor_avatar_url, i.specialty AS instructor_specialty,
               i.linkedin_url AS instructor_linkedin_url, i.github_url AS instructor_github_url,
               i.twitter_url AS instructor_twitter_url, i.years_experience AS instructor_years_experience,
               i.total_students AS instructor_total_students, i.rating AS instructor_rating
        FROM courses c
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE c.id = ?
    ');
    $stmt->execute([$id]);
} else {
    $stmt = $conn->prepare('
        SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.description as category_description,
               u.name AS instructor_name, i.slug AS instructor_slug, i.bio AS instructor_bio,
               i.avatar_url AS instructor_avatar_url, i.specialty AS instructor_specialty,
               i.linkedin_url AS instructor_linkedin_url, i.github_url AS instructor_github_url,
               i.twitter_url AS instructor_twitter_url, i.years_experience AS instructor_years_experience,
               i.total_students AS instructor_total_students, i.rating AS instructor_rating
        FROM courses c
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE c.slug = ?
    ');
    $stmt->execute([$slug]);
}

$course = $stmt->fetch();

if (!$course) {
    sendError('Curso no encontrado', 404);
}

sendSuccess($course, 'Course retrieved');
