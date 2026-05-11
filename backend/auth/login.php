<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('POST');

try {
    $pdo = getPDO();
    $input = getRequestData();

    $email = strtolower(sanitizeInput($input['email'] ?? null));
    $password = (string) ($input['password'] ?? '');

    $errors = [];
    validateEmail('email', $email, $errors);
    validateMinLength('password', $password, 6, $errors, 'contraseña');

    if ($errors !== []) {
        jsonResponse(false, 'Revisa las credenciales enviadas.', ['errors' => $errors], 422);
    }

    $query = $pdo->prepare('
        SELECT users.id, users.name, users.email, users.password, users.created_at, roles.id AS role_id, roles.name AS role
        FROM users
        INNER JOIN roles ON roles.id = users.role_id
        WHERE users.email = :email
        LIMIT 1
    ');
    $query->execute(['email' => $email]);
    $user = $query->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(false, 'Credenciales incorrectas.', null, 401);
    }

    $sessionUser = [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'role_id' => (int) $user['role_id'],
        'created_at' => $user['created_at'],
    ];

    setAuthenticatedUser($sessionUser);

    jsonResponse(true, 'Sesión iniciada correctamente.', ['user' => $sessionUser]);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Login error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido iniciar sesión.', null, 500);
}
