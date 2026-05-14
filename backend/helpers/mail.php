<?php

function getMailEnv($key, $default = '') {
    $value = getenv($key);
    return $value === false ? $default : trim((string) $value);
}

function buildResetPasswordUrl($token) {
    $baseUrl = getMailEnv('RESET_PASSWORD_URL');

    if ($baseUrl === '') {
        $frontendUrl = rtrim(getMailEnv('FRONTEND_URL', 'http://localhost:4321'), '/');
        $baseUrl = $frontendUrl . '/reset-password';
    }

    $baseUrl = rtrim($baseUrl, '/');
    $separator = strpos($baseUrl, '?') !== false ? '&' : '?';

    return $baseUrl . $separator . 'token=' . urlencode($token);
}

function sendEmail($to, $subject, $html) {
    $apiKey = getMailEnv('BREVO_API_KEY');

    if ($apiKey === '') {
        error_log('CoderUp Brevo error: falta BREVO_API_KEY.');
        return ['ok' => false];
    }

    if (!function_exists('curl_init')) {
        error_log('CoderUp Brevo error: la extensión cURL no está disponible.');
        return ['ok' => false];
    }

    if (filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
        error_log('CoderUp Brevo error: email de destino inválido.');
        return ['ok' => false];
    }

    $payload = json_encode([
        'sender' => [
            'name' => getMailEnv('SMTP_FROM_NAME', 'CoderUp'),
            'email' => getMailEnv('SMTP_FROM_EMAIL', 'tu-email@gmail.com'),
        ],
        'to' => [
            ['email' => $to],
        ],
        'subject' => $subject,
        'htmlContent' => $html,
    ], JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        error_log('CoderUp Brevo error: no se pudo codificar el payload.');
        return ['ok' => false];
    }

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'api-key: ' . $apiKey,
            'content-type: application/json',
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 20,
    ]);

    $responseBody = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false || $statusCode < 200 || $statusCode >= 300) {
        error_log('CoderUp Brevo error: HTTP ' . $statusCode . ' ' . $curlError);
        return ['ok' => false];
    }

    return ['ok' => true];
}
