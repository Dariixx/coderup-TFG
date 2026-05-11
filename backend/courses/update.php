<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod(['POST', 'PUT']);
requireRole(['admin', 'editor']);

try {
    $pdo = getPDO();
    $input = getRequestData();
    $effectiveMethod = getMethodOverride($input);

    if (!in_array($effectiveMethod, ['POST', 'PUT'], true)) {
        jsonResponse(false, 'Método no permitido para actualizar cursos.', null, 405);
    }

    $courseId = (int) ($input['id'] ?? 0);
    if ($courseId <= 0) {
        jsonResponse(false, 'Debes indicar el identificador del curso.', null, 422);
    }

    $title = sanitizeInput($input['title'] ?? null);
    $slug = validatedSlug($input['slug'] ?? $title);
    $description = sanitizeInput($input['description'] ?? null);
    $shortDescription = sanitizeInput($input['short_description'] ?? null);
    $image = sanitizeInput($input['image'] ?? null);
    $level = sanitizeInput($input['level'] ?? null);
    $duration = sanitizeInput($input['duration'] ?? null);
    $categoryId = (int) ($input['category_id'] ?? 0);
    $price = (float) ($input['price'] ?? -1);
    $isPremium = (int) (!empty($input['is_premium']));

    $errors = [];
    validateRequired('title', $title, $errors, 'título');
    validateRequired('description', $description, $errors, 'descripción');
    validateRequired('short_description', $shortDescription, $errors, 'descripción corta');
    validateRequired('level', $level, $errors, 'nivel');
    validateRequired('duration', $duration, $errors, 'duración');
    validatePositiveNumber('price', $price, $errors, 'precio');

    if ($categoryId <= 0) {
        $errors['category_id'] = 'Debes seleccionar una categoría válida.';
    }

    if ($slug === '') {
        $errors['slug'] = 'No se ha podido generar un slug válido para el curso.';
    }

    if ($errors !== []) {
        jsonResponse(false, 'Revisa los datos del curso.', ['errors' => $errors], 422);
    }

    $exists = $pdo->prepare('SELECT id FROM courses WHERE id = :id LIMIT 1');
    $exists->execute(['id' => $courseId]);
    if (!$exists->fetch()) {
        jsonResponse(false, 'El curso indicado no existe.', null, 404);
    }

    $slugExists = $pdo->prepare('SELECT id FROM courses WHERE slug = :slug AND id <> :id LIMIT 1');
    $slugExists->execute([
        'slug' => $slug,
        'id' => $courseId,
    ]);
    if ($slugExists->fetch()) {
        jsonResponse(false, 'Ya existe otro curso con el mismo slug.', null, 409);
    }

    $query = $pdo->prepare('
        UPDATE courses
        SET
            category_id = :category_id,
            title = :title,
            slug = :slug,
            description = :description,
            short_description = :short_description,
            image = :image,
            level = :level,
            duration = :duration,
            price = :price,
            is_premium = :is_premium,
            updated_at = NOW()
        WHERE id = :id
    ');
    $query->execute([
        'id' => $courseId,
        'category_id' => $categoryId,
        'title' => $title,
        'slug' => $slug,
        'description' => $description,
        'short_description' => $shortDescription,
        'image' => $image !== '' ? $image : null,
        'level' => $level,
        'duration' => $duration,
        'price' => $price,
        'is_premium' => $isPremium,
    ]);

    jsonResponse(true, 'Curso actualizado correctamente.', ['course_id' => $courseId]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Courses update error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido actualizar el curso.', null, 500);
}
