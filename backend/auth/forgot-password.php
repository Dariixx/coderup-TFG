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
    $sent = sendPasswordResetEmail($user['email'], $user['name'], $resetUrl);

    if (!$sent) {
        if (getenv('RESET_EMAIL_DEBUG') === 'true') {
            sendSuccess([
                'emailSent' => false,
                'resetUrl' => $resetUrl,
            ], 'No se ha podido enviar el email. Usa este enlace de recuperación para pruebas.');
        }

        sendError('No se ha podido enviar el email de recuperación. Revisa la configuración SMTP en Railway.', 500);
    }

    $payload = ['emailSent' => true];
    if (getenv('RESET_EMAIL_DEBUG') === 'true') {
        $payload['resetUrl'] = $resetUrl;
    }

    sendSuccess($payload, 'Email de recuperación enviado correctamente.');
}

sendSuccess(null, 'Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.');
