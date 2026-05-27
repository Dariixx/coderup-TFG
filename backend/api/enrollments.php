<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethods(['GET', 'POST', 'PUT']);

$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('
        SELECT
            e.id,
            e.user_id,
            e.course_id,
            c.title AS course_title,
            c.slug AS course_slug,
            e.progress,
            e.status,
            e.enrolled_at,
            COALESCE(JSON_UNQUOTE(JSON_EXTRACT(c.curriculum, "$.modulos[0].lecciones[0]")), "Bienvenida al curso") AS last_lesson
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    ');
    $stmt->execute([$user['id']]);

    sendSuccess(['enrollments' => $stmt->fetchAll()], 'Inscripciones obtenidas');
}

$input = getJsonInput();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($user['role'] ?? 'guest') === 'guest') {
        sendError('Las cuentas demo no pueden inscribirse en cursos', 403);
    }

    $courseId = (int) ($input['course_id'] ?? $input['courseId'] ?? 0);
    if ($courseId <= 0) {
        sendError('course_id requerido', 400);
    }

    $stmt = $conn->prepare('SELECT id FROM courses WHERE id = ? AND is_published = 1 LIMIT 1');
    $stmt->execute([$courseId]);
    if (!$stmt->fetch()) {
        sendError('Curso no encontrado', 404);
    }

    $stmt = $conn->prepare('
        INSERT INTO enrollments (user_id, course_id, progress, status)
        VALUES (?, ?, 0, "enrolled")
        ON DUPLICATE KEY UPDATE status = "enrolled"
    ');
    $stmt->execute([$user['id'], $courseId]);

    sendSuccess(['course_id' => $courseId], 'Inscripción creada', 201);
}

$enrollmentId = (int) ($input['id'] ?? $input['enrollment_id'] ?? 0);
$progress = max(0, min(100, (float) ($input['progress'] ?? 0)));
$status = $progress >= 100 ? 'completed' : 'enrolled';

if ($enrollmentId <= 0) {
    sendError('enrollment_id requerido', 400);
}

$stmt = $conn->prepare('
    UPDATE enrollments
    SET progress = ?, status = ?, completed_at = IF(? >= 100, NOW(), completed_at)
    WHERE id = ? AND user_id = ?
');
$stmt->execute([$progress, $status, $progress, $enrollmentId, $user['id']]);

sendSuccess(['id' => $enrollmentId, 'progress' => $progress, 'status' => $status], 'Progreso actualizado');
