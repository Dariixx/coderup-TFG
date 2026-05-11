<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

handlePreflight();
requireMethod('GET');

try {
    $pdo = getPDO();
    $id = getQueryParam('id');
    $slug = getQueryParam('slug');

    if ($id === null && $slug === null) {
        jsonResponse(false, 'Debes indicar un id o un slug para recuperar el curso.', null, 422);
    }

    $sql = '
        SELECT
            courses.id,
            courses.category_id,
            categories.name AS category_name,
            categories.slug AS category_slug,
            categories.description AS category_description,
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
        WHERE %s
        LIMIT 1
    ';

    if ($slug !== null) {
        $query = $pdo->prepare(sprintf($sql, 'courses.slug = :slug'));
        $query->execute(['slug' => $slug]);
    } else {
        $query = $pdo->prepare(sprintf($sql, 'courses.id = :id'));
        $query->execute(['id' => $id]);
    }

    $course = $query->fetch();

    if (!$course) {
        jsonResponse(false, 'No se ha encontrado el curso solicitado.', null, 404);
    }

    jsonResponse(true, 'Curso recuperado correctamente.', ['course' => $course]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Courses show error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido recuperar el curso.', null, 500);
}
