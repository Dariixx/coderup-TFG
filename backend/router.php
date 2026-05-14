<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

if (preg_match('#^/api/courses/([^/]+)\.php$#', $path, $matches)) {
    $_GET['slug'] = $matches[1];
    require __DIR__ . '/api/courses/show.php';
    return true;
}

if (preg_match('#^/api/posts/([^/]+)\.php$#', $path, $matches)) {
    $_GET['slug'] = $matches[1];
    require __DIR__ . '/api/posts/show.php';
    return true;
}

if (preg_match('#^/api/instructors/([0-9]+)\.php$#', $path, $matches)) {
    $_GET['id'] = $matches[1];
    require __DIR__ . '/api/instructors/show.php';
    return true;
}

require __DIR__ . '/index.php';
return true;
