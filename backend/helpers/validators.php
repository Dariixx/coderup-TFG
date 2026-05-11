<?php

declare(strict_types=1);

function sanitizeInput(?string $value): string
{
    return trim(strip_tags((string) $value));
}

function validateRequired(string $field, mixed $value, array &$errors, ?string $label = null): void
{
    if ($value === null || (is_string($value) && trim($value) === '') || (is_array($value) && $value === [])) {
        $errors[$field] = sprintf('El campo %s es obligatorio.', $label ?? $field);
    }
}

function validateEmail(string $field, ?string $value, array &$errors): void
{
    if ($value === null || !filter_var($value, FILTER_VALIDATE_EMAIL)) {
        $errors[$field] = 'Debes introducir un email válido.';
    }
}

function validateMinLength(string $field, ?string $value, int $minLength, array &$errors, ?string $label = null): void
{
    if ($value === null || mb_strlen(trim($value)) < $minLength) {
        $errors[$field] = sprintf('El campo %s debe tener al menos %d caracteres.', $label ?? $field, $minLength);
    }
}

function validatePositiveNumber(string $field, mixed $value, array &$errors, ?string $label = null): void
{
    if (!is_numeric($value) || (float) $value < 0) {
        $errors[$field] = sprintf('El campo %s debe ser un número positivo.', $label ?? $field);
    }
}

function validateInArray(string $field, mixed $value, array $allowed, array &$errors, ?string $label = null): void
{
    if (!in_array($value, $allowed, true)) {
        $errors[$field] = sprintf('El campo %s no contiene un valor permitido.', $label ?? $field);
    }
}

function validatedSlug(?string $value): string
{
    $value = sanitizeInput($value);
    $slug = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    return trim($slug, '-');
}
