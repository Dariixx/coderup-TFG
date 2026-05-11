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

    $name = sanitizeInput($input['name'] ?? null);
    $email = strtolower(sanitizeInput($input['email'] ?? null));
    $password = (string) ($input['password'] ?? '');

    $errors = [];
    validateRequired('name', $name, $errors, 'nombre');
    validateEmail('email', $email, $errors);
    validateMinLength('password', $password, 6, $errors, 'contraseña');

    if ($errors !== []) {
        jsonResponse(false, 'Revisa los datos enviados.', ['errors' => $errors], 422);
    }

    $existingUserQuery = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $existingUserQuery->execute(['email' => $email]);

    if ($existingUserQuery->fetch()) {
        jsonResponse(false, 'Ya existe una cuenta con ese email.', null, 409);
    }

    $roleQuery = $pdo->prepare('SELECT id, name FROM roles WHERE name = :name LIMIT 1');
    $roleQuery->execute(['name' => 'cliente']);
    $role = $roleQuery->fetch();

    if (!$role) {
        jsonResponse(false, 'No se ha encontrado el rol por defecto para nuevos usuarios.', null, 500);
    }

    $insertUser = $pdo->prepare('
        INSERT INTO users (role_id, name, email, password, created_at, updated_at)
        VALUES (:role_id, :name, :email, :password, NOW(), NOW())
    ');
    $insertUser->execute([
        'role_id' => $role['id'],
        'name' => $name,
        'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    $user = [
        'id' => (int) $pdo->lastInsertId(),
        'name' => $name,
        'email' => $email,
        'role' => $role['name'],
        'role_id' => (int) $role['id'],
        'created_at' => date('c'),
    ];

    setAuthenticatedUser($user);

    jsonResponse(true, 'Registro completado correctamente.', ['user' => $user], 201);
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Register error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido completar el registro.', null, 500);
}
