<?php

// Valida si un email es válido
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Valida si una contraseña cumple los requisitos
function isValidPassword($password) {
    return strlen($password) >= 6;
}

// Valida si un número es positivo
function isPositiveNumber($num) {
    return is_numeric($num) && $num > 0;
}

// Valida si un string no está vacío
function isNotEmpty($str) {
    return !empty(trim($str));
}

// Sanitiza un email
function sanitizeEmail($email) {
    return filter_var(trim(strtolower($email)), FILTER_SANITIZE_EMAIL);
}

// Sanitiza un string básico
function sanitizeString($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

// Valida un slug
function isValidSlug($slug) {
    return preg_match('/^[a-z0-9\-]+$/', $slug) === 1;
}

// Genera un slug desde un título
function generateSlug($title) {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9\-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

// Valida que un array tenga todas las claves requeridas
function hasRequiredKeys($array, $keys) {
    foreach ($keys as $key) {
        if (!isset($array[$key]) || empty(trim((string)$array[$key]))) {
            return false;
        }
    }
    return true;
}

// Retorna los errores de validación
function validateRequired($data, $fields) {
    $errors = [];
    foreach ($fields as $field => $label) {
        if (!isset($data[$field]) || empty(trim((string)$data[$field]))) {
            $errors[$field] = "{$label} es obligatorio.";
        }
    }
    return $errors;
}
