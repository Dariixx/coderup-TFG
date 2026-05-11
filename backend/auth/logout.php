<?php

declare(strict_types=1);

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod('POST');

logoutAuthenticatedUser();

jsonResponse(true, 'Sesión cerrada correctamente.');
