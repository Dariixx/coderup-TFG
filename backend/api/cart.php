<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/cart.php';

requireMethods(['GET', 'POST', 'DELETE']);

$sessionId = getCartSessionId();
ensureCartTable($conn);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    sendSuccess(fetchCartPayload($conn, $sessionId), 'Carrito obtenido');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $courseId = (int) ($input['course_id'] ?? $input['courseId'] ?? 0);

    if ($courseId <= 0) {
        sendError('course_id requerido', 400);
    }

    $stmt = $conn->prepare('SELECT id, price FROM courses WHERE id = ? AND is_published = 1 LIMIT 1');
    $stmt->execute([$courseId]);
    $course = $stmt->fetch();

    if (!$course) {
        sendError('Curso no encontrado', 404);
    }

    if ((float) $course['price'] <= 0) {
        sendError('Los cursos gratuitos no se añaden al carrito', 400);
    }

    try {
        $stmt = $conn->prepare('INSERT INTO cart_items (session_id, course_id) VALUES (?, ?)');
        $stmt->execute([$sessionId, $courseId]);
    } catch (PDOException $error) {
        if ($error->getCode() !== '23000') {
            sendError('Error al agregar al carrito', 500, $error->getMessage());
        }
    }

    sendSuccess(fetchCartPayload($conn, $sessionId), 'Curso agregado al carrito', 201);
}

$itemId = (int) ($_GET['item_id'] ?? $_GET['id'] ?? 0);
if ($itemId <= 0) {
    sendError('item_id requerido', 400);
}

$stmt = $conn->prepare('DELETE FROM cart_items WHERE id = ? AND session_id = ?');
$stmt->execute([$itemId, $sessionId]);

sendSuccess(fetchCartPayload($conn, $sessionId), 'Item removido del carrito');
