<?php

declare(strict_types=1);

require_once __DIR__ . '/response.php';

function ensureSessionStarted(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_name('coderup_session');
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax',
            'use_strict_mode' => true,
        ]);
    }
}

function setAuthenticatedUser(array $user): void
{
    ensureSessionStarted();
    $_SESSION['user'] = [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'role_id' => (int) $user['role_id'],
        'created_at' => $user['created_at'] ?? null,
    ];
}

function getAuthenticatedUser(): ?array
{
    ensureSessionStarted();
    return $_SESSION['user'] ?? null;
}

function requireAuth(): array
{
    $user = getAuthenticatedUser();

    if ($user === null) {
        jsonResponse(false, 'Debes iniciar sesión para acceder a este recurso.', null, 401);
    }

    return $user;
}

function requireRole(array|string $roles): array
{
    $user = requireAuth();
    $allowedRoles = (array) $roles;

    if (!in_array($user['role'], $allowedRoles, true)) {
        jsonResponse(false, 'No tienes permisos suficientes para realizar esta acción.', [
            'required_roles' => $allowedRoles,
            'current_role' => $user['role'],
        ], 403);
    }

    return $user;
}

function logoutAuthenticatedUser(): void
{
    ensureSessionStarted();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
    }

    session_destroy();
}
