<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/mail.php';

requireMethod('POST');
ensureAuthTables($conn);
ensurePasswordResetColumns($conn);

$input = getJsonInput();
$email = sanitizeEmail($input['email'] ?? '');

if (!isValidEmail($email)) {
    sendSuccess(null, 'Revisa tu email');
}

$stmt = $conn->prepare('SELECT id, name, email FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + 3600);

    $stmt = $conn->prepare('UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?');
    $stmt->execute([$token, $expiresAt, $user['id']]);

    $resetUrl = buildResetPasswordUrl($token);
    $safeResetUrl = htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8');
    $mailResult = sendEmail(
        $user['email'],
        'Recuperar contraseña',
        '<p>Has solicitado restablecer tu contraseña en CoderUp.</p>'
            . '<p><a href="' . $safeResetUrl . '">Restablecer contraseña</a></p>'
            . '<p>Este enlace caduca en 1 hora.</p>'
            . '<p>Si el botón no funciona, copia esta URL:<br>'
            . $safeResetUrl . '</p>'
    );

    if (!$mailResult['ok']) {
        error_log('CoderUp reset password: Brevo no pudo enviar el email.');
    }

    if (!$mailResult['ok'] && getenv('RESET_EMAIL_DEBUG') === 'true') {
        error_log('CoderUp reset email debug URL: ' . $resetUrl);
    }
}

sendSuccess(null, 'Revisa tu email');
