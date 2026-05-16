<?php

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false) {
        http_response_code(500);
        $json = json_encode([
            'ok' => false,
            'data' => null,
            'message' => 'Error al codificar la respuesta JSON',
            'error' => json_last_error_msg(),
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    }

    echo $json;
    exit;
}

function sendError($message, $statusCode = 400, $details = null) {
    $response = [
        'ok' => false,
        'data' => null,
        'message' => $message,
        'error' => $details ?: $message,
    ];

    if ($details && getenv('APP_ENV') === 'development') {
        $response['details'] = $details;
    }

    sendJson($response, $statusCode);
}

set_exception_handler(function (Throwable $error) {
    $response = [
        'ok' => false,
        'data' => null,
        'message' => 'Error interno del servidor',
        'error' => 'internal_server_error',
    ];

    if (getenv('APP_ENV') === 'development') {
        $response['details'] = $error->getMessage();
    }

    sendJson($response, 500);
});

function sendSuccess($data = null, $message = 'Success', $statusCode = 200) {
    $response = [
        'ok' => true,
        'data' => $data,
        'message' => $message,
        'error' => null,
    ];

    sendJson($response, $statusCode);
}

function requireMethod($method) {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        sendError("Method {$method} required", 405);
    }
}

function requireMethods($methods = []) {
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods)) {
        sendError("Method not allowed", 405);
    }
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

    if ($input === false || trim($input) === '') {
        return $_POST ?? [];
    }

    if (stripos($contentType, 'application/json') !== false) {
        $decoded = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            sendError('JSON inválido', 400, json_last_error_msg());
        }

        return $decoded;
    }

    $decoded = json_decode($input, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return $decoded;
    }

    parse_str($input, $parsed);
    return is_array($parsed) ? $parsed : [];
}

function getOrQuery($key, $default = null) {
    return $_GET[$key] ?? $default;
}

function getPostData($key, $default = null) {
    $data = getJsonInput();
    return $data[$key] ?? $default;
}
