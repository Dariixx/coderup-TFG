<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('GET');
requireRole('admin');

try {
    $pdo = getPDO();
    $query = $pdo->query('
        SELECT users.id, users.name, users.email, users.created_at, users.updated_at, roles.id AS role_id, roles.name AS role
        FROM users
        INNER JOIN roles ON roles.id = users.role_id
        ORDER BY users.created_at DESC
    ');

    jsonResponse(true, 'Usuarios recuperados correctamente.', [
        'users' => $query->fetchAll(),
    ]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Users index error: ' . $exception->getMessage());
    jsonResponse(false, 'No se han podido recuperar los usuarios.', null, 500);
}
