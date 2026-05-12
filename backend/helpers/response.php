<?php

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendError($message, $statusCode = 400, $details = null) {
    $response = [
        'ok' => false,
        'message' => $message
    ];

    if ($details && $_ENV['APP_ENV'] === 'development') {
        $response['details'] = $details;
    }

    sendJson($response, $statusCode);
}

function sendSuccess($data = null, $message = 'Success', $statusCode = 200) {
    $response = [
        'ok' => true,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

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
    return json_decode($input, true) ?? [];
}

function getOrQuery($key, $default = null) {
    return $_GET[$key] ?? $default;
}

function getPostData($key, $default = null) {
    $data = getJsonInput();
    return $data[$key] ?? $default;
}
