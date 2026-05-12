<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

requireMethod('GET');

$stmt = $conn->query('
    SELECT i.*, u.name, u.email
    FROM instructors i
    JOIN users u ON u.id = i.user_id
    ORDER BY i.rating DESC, u.name ASC
');

sendSuccess(['instructors' => $stmt->fetchAll()], 'Instructors retrieved');

