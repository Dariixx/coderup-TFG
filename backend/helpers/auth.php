<?php

// Obtiene el usuario actual de la sesión o token
function getCurrentUser() {
    session_start();
    return $_SESSION['user'] ?? null;
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

// Crea una sesión de usuario
function createSession($user) {
    session_start();
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'created_at' => $user['created_at'],
    ];
    return $_SESSION['user'];
}

// Destruye la sesión
function destroySession() {
    session_start();
    session_destroy();
}
