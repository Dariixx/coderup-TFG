<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('GET');
$authUser = requireAuth();

try {
    $requestedUserId = (int) getQueryParam('id', 0);
    $targetUserId = $requestedUserId > 0 ? $requestedUserId : (int) $authUser['id'];

    if ($authUser['role'] !== 'admin' && $targetUserId !== (int) $authUser['id']) {
        jsonResponse(false, 'Solo puedes consultar tu propio usuario.', null, 403);
    }

    $pdo = getPDO();
    $query = $pdo->prepare('
        SELECT users.id, users.name, users.email, users.created_at, users.updated_at, roles.id AS role_id, roles.name AS role
        FROM users
        INNER JOIN roles ON roles.id = users.role_id
        WHERE users.id = :id
        LIMIT 1
    ');
    $query->execute(['id' => $targetUserId]);
    $user = $query->fetch();

    if (!$user) {
        jsonResponse(false, 'No se ha encontrado el usuario solicitado.', null, 404);
    }

    jsonResponse(true, 'Usuario recuperado correctamente.', ['user' => $user]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Users show error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido recuperar el usuario.', null, 500);
}
