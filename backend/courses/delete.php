<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

handlePreflight();
requireMethod(['POST', 'DELETE']);
requireRole('admin');

try {
    $pdo = getPDO();
    $input = getRequestData();
    $effectiveMethod = getMethodOverride($input);

    if (!in_array($effectiveMethod, ['POST', 'DELETE'], true)) {
        jsonResponse(false, 'Método no permitido para eliminar cursos.', null, 405);
    }

    $courseId = (int) ($input['id'] ?? 0);
    if ($courseId <= 0) {
        jsonResponse(false, 'Debes indicar el identificador del curso.', null, 422);
    }

    $query = $pdo->prepare('DELETE FROM courses WHERE id = :id');
    $query->execute(['id' => $courseId]);

    if ($query->rowCount() === 0) {
        jsonResponse(false, 'El curso indicado no existe o ya fue eliminado.', null, 404);
    }

    jsonResponse(true, 'Curso eliminado correctamente.');
} catch (RuntimeException $exception) {
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    error_log('[CoderUp] Courses delete error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido eliminar el curso.', null, 500);
}
