<?php
/**
 * cors.php — CORS para Vercel (frontend) + Railway (backend)
 * Acepta cualquier subdominio de vercel.app y localhost para dev.
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$isAllowed =
    preg_match('/^https:\/\/[\w-]+\.vercel\.app$/', $origin) ||
    preg_match('/^http:\/\/localhost:\d+$/', $origin) ||
    preg_match('/^http:\/\/127\.0\.0\.1:\d+$/', $origin);

if ($isAllowed) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback al dominio de producción configurado por variable de entorno
    $frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:4321';
    header("Access-Control-Allow-Origin: $frontendUrl");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
