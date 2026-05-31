<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/course_metrics.php';

requireMethods(['GET', 'POST']);

ensureCourseReviewsTable($conn);
$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $courseId = (int) getOrQuery('course_id', 0);
    if ($courseId <= 0) {
        sendError('course_id requerido', 400);
    }

    $stmt = $conn->prepare('SELECT rating, comment, updated_at FROM course_reviews WHERE user_id = ? AND course_id = ? LIMIT 1');
    $stmt->execute([$user['id'], $courseId]);
    sendSuccess(['review' => $stmt->fetch() ?: null], 'Valoración obtenida');
}

$input = getJsonInput();
$courseId = (int) ($input['course_id'] ?? $input['courseId'] ?? 0);
$rating = (int) ($input['rating'] ?? 0);
$comment = trim((string) ($input['comment'] ?? ''));

if ($courseId <= 0) {
    sendError('course_id requerido', 400);
}

if ($rating < 1 || $rating > 5) {
    sendError('La valoración debe estar entre 1 y 5', 400);
}

$stmt = $conn->prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1');
$stmt->execute([$user['id'], $courseId]);
if (!$stmt->fetch()) {
    sendError('Solo puedes valorar cursos en los que estás inscrito', 403);
}

try {
    $conn->beginTransaction();
    $stmt = $conn->prepare('
        INSERT INTO course_reviews (user_id, course_id, rating, comment)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)
    ');
    $stmt->execute([$user['id'], $courseId, $rating, $comment !== '' ? $comment : null]);

    syncCourseRating($conn, $courseId);
    $conn->commit();

    sendSuccess(['course_id' => $courseId, 'rating' => $rating], 'Valoración guardada');
} catch (Throwable $error) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    sendError('Error al guardar la valoración', 500, $error->getMessage());
}
