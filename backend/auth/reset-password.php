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
$token = trim((string)($input['token'] ?? ''));
$password = (string)($input['password'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    sendError('Token inválido', 400);
}

if (!isValidPassword($password)) {
    sendError('La contraseña debe tener al menos 6 caracteres', 400);
}

$stmt = $conn->prepare('
    SELECT id FROM users
    WHERE reset_token = ?
      AND reset_token_expires_at IS NOT NULL
      AND reset_token_expires_at > NOW()
    LIMIT 1
');
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    sendError('El enlace ha caducado o no es válido', 400);
}

try {
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    if ($passwordHash === false) {
        sendError('No se ha podido actualizar la contraseña', 500);
    }

    $conn->beginTransaction();

    $stmt = $conn->prepare('
        UPDATE users
        SET password = ?, reset_token = NULL, reset_token_expires_at = NULL, remember_token = NULL
        WHERE id = ?
    ');
    $stmt->execute([$passwordHash, $user['id']]);

    $stmt = $conn->prepare('SELECT password, reset_token, reset_token_expires_at FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch();

    if (
        !$updatedUser ||
        !password_verify($password, $updatedUser['password']) ||
        $updatedUser['reset_token'] !== null ||
        $updatedUser['reset_token_expires_at'] !== null
    ) {
        $conn->rollBack();
        sendError('No se ha podido actualizar la contraseña', 500);
    }

    $conn->commit();
} catch (Throwable $error) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    sendError('No se ha podido actualizar la contraseña', 500, $error->getMessage());
}

sendSuccess(null, 'Contraseña actualizada');
