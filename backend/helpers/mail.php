<?php

function getMailEnv($key, $default = '') {
    $value = getenv($key);
    return $value === false ? $default : trim((string) $value);
}

function getMissingMailConfig() {
    $required = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'SMTP_FROM_EMAIL',
        'SMTP_FROM_NAME',
        'RESET_PASSWORD_URL',
    ];

    $missing = [];
    foreach ($required as $key) {
        if (getMailEnv($key) === '') {
            $missing[] = $key;
        }
    }

    return $missing;
}

function buildResetPasswordUrl($token) {
    $baseUrl = getMailEnv('RESET_PASSWORD_URL');

    if ($baseUrl === '') {
        $frontendUrl = rtrim(getMailEnv('FRONTEND_URL', 'http://localhost:4321'), '/');
        $baseUrl = $frontendUrl . '/reset-password';
    }

    return rtrim($baseUrl, '/') . '?token=' . urlencode($token);
}

function sendPasswordResetEmail($toEmail, $toName, $resetUrl) {
    $subject = 'Restablece tu contraseña de CoderUp';
    $body = "Hola {$toName},\n\n";
    $body .= "Hemos recibido una solicitud para restablecer tu contraseña.\n";
    $body .= "El enlace caduca en 1 hora:\n\n{$resetUrl}\n\n";
    $body .= "Si no has solicitado este cambio, puedes ignorar este mensaje.\n\nCoderUp";

    $fromEmail = getMailEnv('SMTP_FROM_EMAIL', getMailEnv('SMTP_USER', 'no-reply@coderup.local'));
    $fromName = getMailEnv('SMTP_FROM_NAME', 'CoderUp');

    if (filter_var($toEmail, FILTER_VALIDATE_EMAIL) === false || filter_var($fromEmail, FILTER_VALIDATE_EMAIL) === false) {
        error_log('CoderUp mail error: email de destino o remitente inválido.');
        return false;
    }

    $missing = getMissingMailConfig();
    if (!empty($missing)) {
        error_log('CoderUp mail warning: faltan variables SMTP: ' . implode(', ', $missing));
    }

    if (getMailEnv('SMTP_HOST') !== '' && getMailEnv('SMTP_USER') !== '' && getMailEnv('SMTP_PASS') !== '') {
        return sendSmtpMail($toEmail, $subject, $body, $fromEmail, $fromName);
    }

    return sendNativeMail($toEmail, $subject, $body, $fromEmail, $fromName);
}

function sendNativeMail($toEmail, $subject, $body, $fromEmail, $fromName) {
    $headers = [
        'From: ' . formatMailAddress($fromEmail, $fromName),
        'Reply-To: ' . $fromEmail,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];

    return @mail($toEmail, encodeMailHeader($subject), $body, implode("\r\n", $headers));
}

function sendSmtpMail($toEmail, $subject, $body, $fromEmail, $fromName) {
    $host = getMailEnv('SMTP_HOST');
    $port = (int) getMailEnv('SMTP_PORT', '587');
    $secure = $port === 465 ? 'ssl' : 'tls';
    $remoteHost = $secure === 'ssl' ? "ssl://{$host}" : $host;
    $socket = @fsockopen($remoteHost, $port, $errno, $errstr, 20);

    if (!$socket) {
        error_log("CoderUp SMTP error: no se pudo conectar a {$host}:{$port}. {$errno} {$errstr}");
        return false;
    }

    stream_set_timeout($socket, 20);

    $read = function () use ($socket) {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    };

    $expect = function ($response, $codes) {
        $code = substr($response, 0, 3);
        return in_array($code, (array) $codes, true);
    };

    $write = function ($command, $codes) use ($socket, $read, $expect) {
        fwrite($socket, $command . "\r\n");
        $response = $read();

        if (!$expect($response, $codes)) {
            error_log('CoderUp SMTP error: respuesta inesperada: ' . trim($response));
            return false;
        }

        return true;
    };

    if (!$expect($read(), ['220'])) {
        fclose($socket);
        return false;
    }

    if (!$write('EHLO coderup.local', ['250'])) {
        fclose($socket);
        return false;
    }

    if ($secure === 'tls') {
        if (!$write('STARTTLS', ['220'])) {
            fclose($socket);
            return false;
        }

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            error_log('CoderUp SMTP error: no se pudo activar TLS.');
            fclose($socket);
            return false;
        }

        if (!$write('EHLO coderup.local', ['250'])) {
            fclose($socket);
            return false;
        }
    }

    if (!$write('AUTH LOGIN', ['334'])) {
        fclose($socket);
        return false;
    }

    if (!$write(base64_encode(getMailEnv('SMTP_USER')), ['334'])) {
        fclose($socket);
        return false;
    }

    if (!$write(base64_encode(getMailEnv('SMTP_PASS')), ['235'])) {
        fclose($socket);
        return false;
    }

    if (!$write('MAIL FROM:<' . $fromEmail . '>', ['250'])) {
        fclose($socket);
        return false;
    }

    if (!$write('RCPT TO:<' . $toEmail . '>', ['250', '251'])) {
        fclose($socket);
        return false;
    }

    if (!$write('DATA', ['354'])) {
        fclose($socket);
        return false;
    }

    $message = buildSmtpMessage($toEmail, $subject, $body, $fromEmail, $fromName);
    if (!$write($message . "\r\n.", ['250'])) {
        fclose($socket);
        return false;
    }

    $write('QUIT', ['221']);
    fclose($socket);

    return true;
}

function buildSmtpMessage($toEmail, $subject, $body, $fromEmail, $fromName) {
    $headers = [
        'From: ' . formatMailAddress($fromEmail, $fromName),
        'To: ' . $toEmail,
        'Subject: ' . encodeMailHeader($subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];

    return implode("\r\n", $headers) . "\r\n\r\n" . escapeSmtpBody($body);
}

function formatMailAddress($email, $name) {
    $safeName = str_replace(["\r", "\n", '"'], '', $name);
    return encodeMailHeader($safeName) . ' <' . $email . '>';
}

function encodeMailHeader($value) {
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($value, 'UTF-8', 'B', "\r\n");
    }

    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function escapeSmtpBody($body) {
    $normalized = str_replace(["\r\n", "\r"], "\n", $body);
    $lines = explode("\n", $normalized);

    foreach ($lines as &$line) {
        if (isset($line[0]) && $line[0] === '.') {
            $line = '.' . $line;
        }
    }

    return implode("\r\n", $lines);
}
