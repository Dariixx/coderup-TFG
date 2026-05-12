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

function ensureAuthTables($conn) {
    static $checked = false;
    if ($checked) {
        return;
    }

    $conn->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            remember_token VARCHAR(128) NULL UNIQUE,
            role ENUM('admin', 'editor', 'client', 'guest') DEFAULT 'client',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_remember_token (remember_token),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $checked = true;
}

function ensureRememberTokenColumn($conn) {
    static $checked = false;
    if ($checked) {
        return;
    }

    ensureAuthTables($conn);

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

function ensurePasswordResetColumns($conn) {
    ensureAuthTables($conn);

    try {
        $conn->query('SELECT reset_token FROM users LIMIT 1');
    } catch (PDOException $e) {
        if (stripos($e->getMessage(), 'reset_token') !== false || stripos($e->getMessage(), 'Unknown column') !== false) {
            $conn->exec('ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL AFTER remember_token');
            try {
                $conn->exec('CREATE INDEX idx_reset_token ON users (reset_token)');
            } catch (PDOException $indexError) {
                // El índice puede existir si Railway reintenta la migración.
            }
        } else {
            throw $e;
        }
    }

    try {
        $conn->query('SELECT reset_token_expires_at FROM users LIMIT 1');
    } catch (PDOException $e) {
        if (stripos($e->getMessage(), 'reset_token_expires_at') !== false || stripos($e->getMessage(), 'Unknown column') !== false) {
            $conn->exec('ALTER TABLE users ADD COLUMN reset_token_expires_at TIMESTAMP NULL AFTER reset_token');
            return;
        }
        throw $e;
    }
}

function sendPasswordResetEmail($email, $name, $resetUrl) {
    $subject = 'Restablece tu contraseña de CoderUp';
    $body = "Hola {$name},\n\n";
    $body .= "Hemos recibido una solicitud para restablecer tu contraseña.\n";
    $body .= "El enlace caduca en 1 hora:\n\n{$resetUrl}\n\n";
    $body .= "Si no has solicitado este cambio, puedes ignorar este mensaje.\n\nCoderUp";

    $from = getenv('SMTP_USER') ?: 'no-reply@coderup.local';
    $headers = [
        'From: CoderUp <' . $from . '>',
        'Reply-To: ' . $from,
        'Content-Type: text/plain; charset=UTF-8',
    ];

    if (getenv('SMTP_HOST') && getenv('SMTP_USER') && getenv('SMTP_PASS')) {
        return sendSmtpMail($email, $subject, $body, $from);
    }

    return @mail($email, $subject, $body, implode("\r\n", $headers));
}

function sendSmtpMail($to, $subject, $body, $from) {
    $host = getenv('SMTP_HOST');
    $port = (int)(getenv('SMTP_PORT') ?: 587);
    $remote = $port === 465 ? "ssl://{$host}" : $host;
    $socket = @fsockopen($remote, $port, $errno, $errstr, 15);

    if (!$socket) {
        return false;
    }

    $read = function () use ($socket) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    };

    $write = function ($command) use ($socket, $read) {
        fwrite($socket, $command . "\r\n");
        return $read();
    };

    $read();
    $write('EHLO coderup.local');

    if ($port !== 465) {
        $write('STARTTLS');
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $write('EHLO coderup.local');
    }

    $write('AUTH LOGIN');
    $write(base64_encode(getenv('SMTP_USER')));
    $write(base64_encode(getenv('SMTP_PASS')));
    $write('MAIL FROM:<' . $from . '>');
    $write('RCPT TO:<' . $to . '>');
    $write('DATA');

    $message = "From: CoderUp <{$from}>\r\n";
    $message .= "To: {$to}\r\n";
    $message .= "Subject: {$subject}\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $message .= $body . "\r\n.";
    $write($message);
    $write('QUIT');
    fclose($socket);

    return true;
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
