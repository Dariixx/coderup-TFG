<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/mail.php';

requireMethod('POST');

$input = getJsonInput();
$email = sanitizeEmail($input['email'] ?? '');

if (!isValidEmail($email)) {
    sendError('Introduce un email válido para recibir la newsletter.', 400);
}

$stmt = $conn->query('
    SELECT title, slug, description
    FROM courses
    WHERE is_published = 1
    ORDER BY rating DESC, total_students DESC
    LIMIT 3
');
$courses = $stmt->fetchAll();

$items = '';
foreach ($courses as $course) {
    $title = htmlspecialchars($course['title'], ENT_QUOTES, 'UTF-8');
    $slug = htmlspecialchars($course['slug'], ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars(substr(strip_tags($course['description']), 0, 140), ENT_QUOTES, 'UTF-8');
    $frontendUrl = rtrim(getMailEnv('FRONTEND_URL', 'https://coderup-tfg.vercel.app'), '/');
    $items .= '<li style="margin:0 0 16px 0;"><strong>' . $title . '</strong><br><span>' . $description . '...</span><br><a href="' . $frontendUrl . '/cursos/' . $slug . '">Ver curso</a></li>';
}

$html = '
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827;">
      <h1 style="color:#087a3d;">Novedades CoderUp</h1>
      <p>Gracias por apuntarte. Aquí tienes una selección breve de cursos destacados para seguir practicando.</p>
      <ul style="padding-left:18px;">' . $items . '</ul>
      <p style="font-size:13px;color:#667085;">CoderUp está en beta, por eso compartimos novedades sin procesar pagos reales todavía.</p>
    </div>
';

$mailResult = sendEmail($email, 'Cursos destacados de CoderUp', $html);

if (!$mailResult['ok']) {
    sendError('No se ha podido enviar la newsletter ahora mismo. Revisa la configuración de Brevo.', 500);
}

sendSuccess(null, 'Te hemos enviado una selección de cursos destacados.');
