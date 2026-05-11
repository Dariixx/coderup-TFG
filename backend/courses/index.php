<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

handlePreflight();
requireMethod('GET');

try {
    $pdo = getPDO();
    $query = $pdo->query('
        SELECT
            courses.id,
            courses.category_id,
            categories.name AS category_name,
            categories.slug AS category_slug,
            courses.title,
            courses.slug,
            courses.description,
            courses.short_description,
            courses.image,
            courses.level,
            courses.duration,
            courses.price,
            courses.is_premium,
            courses.created_at,
            courses.updated_at
        FROM courses
        INNER JOIN categories ON categories.id = courses.category_id
        ORDER BY courses.created_at DESC
    ');

    jsonResponse(true, 'Cursos recuperados correctamente.', [
        'courses' => $query->fetchAll(),
    ]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Courses index error: ' . $exception->getMessage());
    jsonResponse(false, 'No se han podido recuperar los cursos.', null, 500);
}
