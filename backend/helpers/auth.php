<?php

function getAuthSecret() {
    return getenv('AUTH_SECRET')
        ?: getenv('JWT_SECRET')
        ?: getenv('APP_SECRET')
        ?: getenv('DB_PASS')
        ?: 'coderup-local-auth-secret';
}

function base64UrlEncode($value) {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function ensureRememberTokenColumn($conn) {
    static $checked = false;
    if ($checked) {
        return;
    }

    try {
        $conn->query('SELECT remember_token FROM users LIMIT 1');
        $checked = true;
    } catch (PDOException $e) {
        if (stripos($e->getMessage(), 'remember_token') === false && stripos($e->getMessage(), 'Unknown column') === false) {
            throw $e;
        }

        $conn->exec('ALTER TABLE users ADD COLUMN remember_token VARCHAR(128) NULL UNIQUE AFTER password');
        $checked = true;
    }
}

function publicUser($user) {
    unset($user['password'], $user['remember_token']);
    return [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'] ?? 'client',
        'created_at' => $user['created_at'] ?? null,
    ];
}

function getBearerToken() {
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $_SERVER['Authorization']
        ?? '';

    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function createAuthToken($conn, $userId) {
    ensureRememberTokenColumn($conn);

    $payload = base64UrlEncode(json_encode([
        'uid' => (string) $userId,
        'iat' => time(),
        'rnd' => bin2hex(random_bytes(16)),
    ]));
    $signature = hash_hmac('sha256', $payload, getAuthSecret());
    $token = $payload . '.' . $signature;
    $tokenHash = hash('sha256', $token);

    $stmt = $conn->prepare('UPDATE users SET remember_token = ? WHERE id = ?');
    $stmt->execute([$tokenHash, $userId]);

    return $token;
}

function isValidAuthToken($token) {
    if (!$token || substr_count($token, '.') !== 1) {
        return false;
    }

    [$payload, $signature] = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $payload, getAuthSecret());

    return hash_equals($expected, $signature);
}

// Obtiene el usuario actual desde Authorization: Bearer <token>
function getCurrentUser() {
    global $conn;

    if (!$conn) {
        return null;
    }

    $token = getBearerToken();
    if (!isValidAuthToken($token)) {
        return null;
    }

    ensureRememberTokenColumn($conn);

    $stmt = $conn->prepare('SELECT id, name, email, role, created_at FROM users WHERE remember_token = ? LIMIT 1');
    $stmt->execute([hash('sha256', $token)]);
    $user = $stmt->fetch();

    return $user ? publicUser($user) : null;
}

// Requiere que el usuario esté autenticado
function requireAuth() {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    return $user;
}

// Requiere que el usuario tenga un rol específico
function requireRole($role) {
    $user = requireAuth();
    if ($user['role'] !== $role) {
        sendError('Forbidden', 403);
    }
    return $user;
}

// Requiere que el usuario sea admin o editor
function requireAdminOrEditor() {
    $user = requireAuth();
    if (!in_array($user['role'], ['admin', 'editor'])) {
        sendError('Forbidden', 403);
    }
    return $user;
}

// Hashea una contraseña
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

// Verifica una contraseña
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Crea un token de usuario para clientes entre dominios
function createSession($user) {
    global $conn;

    $safeUser = publicUser($user);
    return [
        'user' => $safeUser,
        'token' => createAuthToken($conn, $user['id']),
    ];
}

// Invalida el token enviado por Authorization
function destroySession() {
    global $conn;

    $token = getBearerToken();
    if (!$conn || !isValidAuthToken($token)) {
        return;
    }

    ensureRememberTokenColumn($conn);

    $stmt = $conn->prepare('UPDATE users SET remember_token = NULL WHERE remember_token = ?');
    $stmt->execute([hash('sha256', $token)]);
}
