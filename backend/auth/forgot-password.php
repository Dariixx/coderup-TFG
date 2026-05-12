<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');
ensureAuthTables($conn);
ensurePasswordResetColumns($conn);

$input = getJsonInput();
$email = sanitizeEmail($input['email'] ?? '');

if (!isValidEmail($email)) {
    sendError('Introduce un email válido', 400);
}

$stmt = $conn->prepare('SELECT id, name, email FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + 3600);

    $stmt = $conn->prepare('UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?');
    $stmt->execute([$token, $expiresAt, $user['id']]);

    $resetBaseUrl = getenv('RESET_PASSWORD_URL');
    if (!$resetBaseUrl) {
        $frontendUrl = rtrim(getenv('FRONTEND_URL') ?: 'http://localhost:4321', '/');
        $resetBaseUrl = $frontendUrl . '/reset-password';
    }

    $resetUrl = rtrim($resetBaseUrl, '/') . '?token=' . urlencode($token);
    sendPasswordResetEmail($user['email'], $user['name'], $resetUrl);
}

sendSuccess(null, 'Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.');
