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

$stmt = $conn->query('
    SELECT id AS instructor_id, name AS instructor_name, email AS instructor_email,
           bio AS instructor_bio, avatar_url AS instructor_avatar_url,
           specialty AS instructor_specialty, years_experience AS instructor_years_experience,
           total_students AS instructor_total_students, rating AS instructor_rating
    FROM instructors
    ORDER BY id ASC
');

$instructors = array_map('formatInstructor', $stmt->fetchAll());
$instructor = null;

foreach ($instructors as $candidate) {
    if (($id && (int) $candidate['id'] === (int) $id) || ($slug && $candidate['slug'] === $slug)) {
        $instructor = $candidate;
        break;
    }
}

if (!$instructor) {
    sendError('Instructor no encontrado', 404);
}

$stmt = $conn->prepare(courseSelectSql() . ' WHERE c.instructor_id = ? AND c.is_published = 1 ORDER BY c.created_at DESC');
$stmt->execute([$instructor['id']]);

sendSuccess([
    'instructor' => $instructor,
    'courses' => array_map('formatCourse', $stmt->fetchAll()),
], 'Instructor retrieved');
