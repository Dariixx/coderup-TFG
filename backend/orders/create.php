<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validators.php';

handlePreflight();
requireMethod('POST');
$user = requireAuth();

try {
    $pdo = getPDO();
    $input = getRequestData();
    $courses = $input['courses'] ?? [];
    $discountCode = strtoupper(sanitizeInput($input['discount_code'] ?? null));

    if (!is_array($courses) || $courses === []) {
        jsonResponse(false, 'Debes enviar al menos un curso para crear el pedido.', null, 422);
    }

    $courseIds = array_values(array_unique(array_map('intval', $courses)));
    $placeholders = implode(',', array_fill(0, count($courseIds), '?'));

    $courseQuery = $pdo->prepare("
        SELECT id, title, price
        FROM courses
        WHERE id IN ($placeholders)
    ");
    $courseQuery->execute($courseIds);
    $dbCourses = $courseQuery->fetchAll();

    if (count($dbCourses) !== count($courseIds)) {
        jsonResponse(false, 'Uno o varios cursos no existen en la base de datos.', null, 404);
    }

    $subtotal = array_reduce($dbCourses, static fn (float $carry, array $course): float => $carry + (float) $course['price'], 0.0);
    $discountAmount = 0.0;

    if ($discountCode === 'WELCOME20') {
        $orderCountQuery = $pdo->prepare('SELECT COUNT(*) FROM orders WHERE user_id = :user_id');
        $orderCountQuery->execute(['user_id' => $user['id']]);
        $existingOrders = (int) $orderCountQuery->fetchColumn();

        if ($existingOrders > 0) {
            jsonResponse(false, 'El descuento de bienvenida solo puede usarse en el primer pedido.', null, 422);
        }

        $discountAmount = round($subtotal * 0.20, 2);
    } elseif ($discountCode !== '') {
        jsonResponse(false, 'El código de descuento enviado no es válido.', null, 422);
    }

    $total = max(0, round($subtotal - $discountAmount, 2));

    $pdo->beginTransaction();

    $orderInsert = $pdo->prepare('
        INSERT INTO orders (user_id, total, discount_code, discount_amount, status, created_at)
        VALUES (:user_id, :total, :discount_code, :discount_amount, :status, NOW())
    ');
    $orderInsert->execute([
        'user_id' => $user['id'],
        'total' => $total,
        'discount_code' => $discountCode !== '' ? $discountCode : null,
        'discount_amount' => $discountAmount,
        'status' => 'completed',
    ]);

    $orderId = (int) $pdo->lastInsertId();

    $itemInsert = $pdo->prepare('
        INSERT INTO order_items (order_id, course_id, price, created_at)
        VALUES (:order_id, :course_id, :price, NOW())
    ');

    foreach ($dbCourses as $course) {
        $itemInsert->execute([
            'order_id' => $orderId,
            'course_id' => (int) $course['id'],
            'price' => (float) $course['price'],
        ]);
    }

    $pdo->commit();

    jsonResponse(true, 'Pedido creado correctamente.', [
        'order' => [
            'id' => $orderId,
            'user_id' => $user['id'],
            'items' => $dbCourses,
            'subtotal' => round($subtotal, 2),
            'discount_amount' => $discountAmount,
            'discount_code' => $discountCode !== '' ? $discountCode : null,
            'total' => $total,
            'status' => 'completed',
        ],
    ], 201);
} catch (RuntimeException $exception) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, $exception->getMessage(), null, 500);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('[CoderUp] Orders create error: ' . $exception->getMessage());
    jsonResponse(false, 'No se ha podido crear el pedido.', null, 500);
}
