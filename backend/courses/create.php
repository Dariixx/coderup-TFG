<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('POST');
requireRole(['admin', 'editor']);

try {
    $pdo = getPDO();
    $input = getRequestData();

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

    $exists = $pdo->prepare('SELECT id FROM courses WHERE slug = :slug LIMIT 1');
    $exists->execute(['slug' => $slug]);
    if ($exists->fetch()) {
        jsonResponse(false, 'Ya existe un curso con el mismo slug.', null, 409);
    }

    $query = $pdo->prepare('
        INSERT INTO courses (
            category_id, title, slug, description, short_description, image, level, duration, price, is_premium, created_at, updated_at
        ) VALUES (
            :category_id, :title, :slug, :description, :short_description, :image, :level, :duration, :price, :is_premium, NOW(), NOW()
        )
    ');
    $query->execute([
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

    jsonResponse(true, 'Curso creado correctamente.', [
        'course_id' => (int) $pdo->lastInsertId(),
    ], 201);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Courses create error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido crear el curso.', null, 500);
}
