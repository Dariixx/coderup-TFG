<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validators.php';

handlePreflight();
requireMethod('POST');
requireRole('admin');

try {
    $pdo = getPDO();
    $input = getRequestData();

    $userId = (int) ($input['user_id'] ?? 0);
    $roleId = (int) ($input['role_id'] ?? 0);

    if ($userId <= 0 || $roleId <= 0) {
        jsonResponse(false, 'Debes indicar un usuario y un rol válidos.', null, 422);
    }

    $roleQuery = $pdo->prepare('SELECT id, name FROM roles WHERE id = :id LIMIT 1');
    $roleQuery->execute(['id' => $roleId]);
    $role = $roleQuery->fetch();

    if (!$role) {
        jsonResponse(false, 'El rol indicado no existe.', null, 404);
    }

    $update = $pdo->prepare('UPDATE users SET role_id = :role_id, updated_at = NOW() WHERE id = :id');
    $update->execute([
        'role_id' => $roleId,
        'id' => $userId,
    ]);

    if ($update->rowCount() === 0) {
        jsonResponse(false, 'No se ha podido actualizar el rol del usuario.', null, 404);
    }

    jsonResponse(true, 'Rol actualizado correctamente.', [
        'user_id' => $userId,
        'role' => $role,
    ]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Update role error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido actualizar el rol del usuario.', null, 500);
}
