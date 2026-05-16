<?php

function decodeJsonColumn($value, $fallback = []) {
    if (is_array($value)) {
        return $value;
    }

    if (!is_string($value) || trim($value) === '') {
        return $fallback;
    }

    $decoded = json_decode($value, true);
    return json_last_error() === JSON_ERROR_NONE ? $decoded : $fallback;
}

function instructorSlug($name, $id) {
    $slug = strtolower(trim($name));
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT', $slug);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');

    return ($slug ?: 'instructor') . '-' . $id;
}

function formatInstructor($row) {
    if (!$row) {
        return null;
    }

    return [
        'id' => (int) $row['instructor_id'],
        'name' => $row['instructor_name'],
        'slug' => instructorSlug($row['instructor_name'], $row['instructor_id']),
        'email' => $row['instructor_email'] ?? null,
        'bio' => $row['instructor_bio'] ?? '',
        'avatar_url' => $row['instructor_avatar_url'] ?? null,
        'specialty' => $row['instructor_specialty'] ?? '',
        'years_experience' => (int) ($row['instructor_years_experience'] ?? 0),
        'total_students' => (int) ($row['instructor_total_students'] ?? 0),
        'rating' => (float) ($row['instructor_rating'] ?? 0),
    ];
}

function formatCategory($row) {
    return [
        'id' => (int) $row['category_id'],
        'name' => $row['category_name'],
        'slug' => $row['category_slug'],
        'description' => $row['category_description'] ?? null,
        'icon' => $row['category_icon'] ?? null,
    ];
}

function formatCourse($row) {
    $curriculum = decodeJsonColumn($row['curriculum']);
    $requirements = $row['requirements'] ?? $row['requires'] ?? null;
    if (isset($curriculum['modulos']) && is_array($curriculum['modulos'])) {
        $curriculum = array_map(function ($module) {
            return [
                'title' => $module['title'] ?? $module['nombre'] ?? '',
                'lessons' => $module['lessons'] ?? $module['lecciones'] ?? [],
                'duration' => $module['duration'] ?? $module['duracion'] ?? null,
            ];
        }, $curriculum['modulos']);
    }

    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'short_description' => substr(strip_tags($row['description']), 0, 160),
        'thumbnail_url' => $row['thumbnail_url'],
        'price' => (float) $row['price'],
        'level' => $row['level'],
        'category_id' => (int) $row['category_id'],
        'instructor_id' => (int) $row['instructor_id'],
        'duration_hours' => (int) $row['duration_hours'],
        'duration' => ((int) $row['duration_hours']) . 'h de contenido',
        'total_lessons' => (int) $row['total_lessons'],
        'total_students' => (int) $row['total_students'],
        'rating' => (float) $row['rating'],
        'is_featured' => isset($row['is_featured']) ? (bool) $row['is_featured'] : (float) $row['rating'] >= 4.8,
        'requirements' => decodeJsonColumn($requirements),
        'requires' => decodeJsonColumn($requirements),
        'what_you_learn' => decodeJsonColumn($row['what_you_learn']),
        'curriculum' => $curriculum,
        'is_published' => (bool) $row['is_published'],
        'category' => formatCategory($row),
        'instructor' => formatInstructor($row),
        'category_name' => $row['category_name'],
        'category_slug' => $row['category_slug'],
        'category_description' => $row['category_description'] ?? null,
        'instructor_name' => $row['instructor_name'],
        'instructor_slug' => instructorSlug($row['instructor_name'], $row['instructor_id']),
        'instructor_bio' => $row['instructor_bio'] ?? '',
        'instructor_avatar_url' => $row['instructor_avatar_url'] ?? null,
        'instructor_specialty' => $row['instructor_specialty'] ?? '',
        'instructor_years_experience' => (int) ($row['instructor_years_experience'] ?? 0),
        'instructor_total_students' => (int) ($row['instructor_total_students'] ?? 0),
        'instructor_rating' => (float) ($row['instructor_rating'] ?? 0),
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function courseSelectSql() {
    return '
        SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
               cat.description AS category_description, cat.icon AS category_icon,
               i.id AS instructor_id, i.name AS instructor_name, i.email AS instructor_email,
               i.bio AS instructor_bio, i.avatar_url AS instructor_avatar_url,
               i.specialty AS instructor_specialty, i.years_experience AS instructor_years_experience,
               i.total_students AS instructor_total_students, i.rating AS instructor_rating
        FROM courses c
        JOIN categories cat ON c.category_id = cat.id
        JOIN instructors i ON c.instructor_id = i.id
    ';
}

function formatPost($row) {
    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'excerpt' => $row['excerpt'],
        'content' => $row['content'],
        'cover_image_url' => $row['cover_image_url'],
        'author_id' => (int) $row['author_id'],
        'author_name' => $row['author_name'],
        'author' => [
            'id' => (int) $row['author_id'],
            'name' => $row['author_name'],
            'avatar_url' => $row['author_avatar_url'],
            'specialty' => $row['author_specialty'],
        ],
        'category' => $row['category'],
        'tags' => decodeJsonColumn($row['tags']),
        'read_time' => (int) $row['read_time_minutes'],
        'read_time_minutes' => (int) $row['read_time_minutes'],
        'is_published' => (bool) $row['is_published'],
        'published_at' => $row['published_at'],
    ];
}

function postSelectSql() {
    return '
        SELECT p.*, i.name AS author_name, i.avatar_url AS author_avatar_url,
               i.specialty AS author_specialty
        FROM posts p
        JOIN instructors i ON p.author_id = i.id
    ';
}
