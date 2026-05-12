<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');

$input = getJsonInput();

$errors = validateRequired($input, [
    'name'     => 'Nombre',
    'email'    => 'Email',
    'password' => 'Contraseña',
]);

if (!empty($errors)) {
    sendError('Validation failed', 400, $errors);
}

$name     = sanitizeString($input['name']);
$email    = sanitizeEmail($input['email']);
$password = $input['password'];

if (!isValidEmail($email)) {
    sendError('Email inválido', 400);
}

if (!isValidPassword($password)) {
    sendError('La contraseña debe tener al menos 6 caracteres', 400);
}

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    sendError('Ya existe una cuenta con este email', 409);
}

$passwordHash = hashPassword($password);

try {
    $stmt = $conn->prepare('
        INSERT INTO users (name, email, password, role, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ');
    $stmt->execute([$name, $email, $passwordHash, 'client']);
    $userId = $conn->lastInsertId();

    $stmt = $conn->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    createSession($user);

    sendSuccess($user, 'Usuario registrado correctamente', 201);
} catch (PDOException $e) {
    sendError('Error al registrar usuario', 500);
}
