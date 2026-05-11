<?php

declare(strict_types=1);

function jsonResponse(bool $success, string $message, mixed $data = null, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');

    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}

function allowCorsForDevelopment(): void
{
    $allowedOrigin = getenv('APP_FRONTEND_URL') ?: '*';
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

function handlePreflight(): void
{
    allowCorsForDevelopment();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function requireMethod(array|string $methods): void
{
    $allowed = (array) $methods;
    $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

    if (!in_array($requestMethod, $allowed, true)) {
        jsonResponse(false, 'Método no permitido.', ['allowed_methods' => $allowed], 405);
    }
}

function getRequestData(): array
{
    $rawBody = file_get_contents('php://input') ?: '';
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    $data = [];

    if (str_contains($contentType, 'application/json') && $rawBody !== '') {
        $decoded = json_decode($rawBody, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            jsonResponse(false, 'El cuerpo JSON no es válido.', null, 400);
        }

        $data = is_array($decoded) ? $decoded : [];
    } elseif (!empty($_POST)) {
        $data = $_POST;
    } elseif ($rawBody !== '') {
        parse_str($rawBody, $parsed);
        $data = is_array($parsed) ? $parsed : [];
    }

    return $data;
}

function getQueryParam(string $key, mixed $default = null): mixed
{
    return $_GET[$key] ?? $default;
}

function getMethodOverride(array $data): string
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $override = strtoupper((string) ($data['_method'] ?? ''));

    if ($method === 'POST' && in_array($override, ['PUT', 'DELETE'], true)) {
        return $override;
    }

    return $method;
}
