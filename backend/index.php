<?php
/**
 * index.php — Punto de entrada del backend en Railway.
 * Sirve como health check y router básico.
 */
header('Content-Type: application/json');
echo json_encode([
    'status' => 'ok',
    'app'    => 'CoderUp API',
    'version' => '1.0.0',
]);
