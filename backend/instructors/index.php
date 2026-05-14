<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/catalog.php';

requireMethod('GET');

$stmt = $conn->query('
    SELECT id AS instructor_id, name AS instructor_name, email AS instructor_email,
           bio AS instructor_bio, avatar_url AS instructor_avatar_url,
           specialty AS instructor_specialty, years_experience AS instructor_years_experience,
           total_students AS instructor_total_students, rating AS instructor_rating
    FROM instructors
    ORDER BY rating DESC, name ASC
');

sendSuccess(['instructors' => array_map('formatInstructor', $stmt->fetchAll())], 'Instructors retrieved');
