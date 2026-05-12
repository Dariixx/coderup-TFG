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
    'email'    => 'Email',
    'password' => 'Contraseña',
]);

if (!empty($errors)) {
    sendError('Validation failed', 400, $errors);
}

$email    = sanitizeEmail($input['email']);
$password = $input['password'];

if (!isValidEmail($email)) {
    sendError('Email inválido', 400);
}

if (!isValidPassword($password)) {
    sendError('La contraseña debe tener al menos 6 caracteres', 400);
}

$stmt = $conn->prepare('SELECT id, name, email, password, role, created_at FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !verifyPassword($password, $user['password'])) {
    sendError('Credenciales incorrectas', 401);
}

unset($user['password']);

createSession($user);

sendSuccess($user, 'Sesión iniciada correctamente');
