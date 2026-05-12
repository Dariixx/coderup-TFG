<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

$user = getCurrentUser();
if (!$user) {
    sendError('No autenticado', 401);
}
sendSuccess($user);
