<?php

declare(strict_types=1);

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('GET');

$user = getAuthenticatedUser();

if ($user === null) {
    jsonResponse(false, 'No hay ninguna sesión activa.', null, 401);
}

jsonResponse(true, 'Usuario autenticado recuperado correctamente.', ['user' => $user]);
