<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';

requireMethod('GET');

$topics = [
    'astro' => 'withastro/astro',
    'react' => 'facebook/react',
    'typescript' => 'microsoft/TypeScript',
];

$projects = [];

foreach ($topics as $topic => $repo) {
    $url = 'https://api.github.com/repos/' . $repo;
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: CoderUp-TFG\r\nAccept: application/vnd.github+json\r\n",
            'timeout' => 4,
        ],
    ]);

    $raw = @file_get_contents($url, false, $context);
    if (!$raw) {
        continue;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['full_name'])) {
        continue;
    }

    $projects[] = [
        'topic' => $topic,
        'name' => $data['full_name'],
        'description' => $data['description'] ?? 'Repositorio open source para practicar lectura de código real.',
        'url' => $data['html_url'],
        'stars' => (int) ($data['stargazers_count'] ?? 0),
        'language' => $data['language'] ?? 'Code',
    ];
}

sendSuccess(['projects' => $projects], 'Proyectos de GitHub obtenidos');
