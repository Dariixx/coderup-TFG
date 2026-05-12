<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validators.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');
$user = requireAuth();

$input = getJsonInput();

// Validar que hay items
if (empty($input['items']) || !is_array($input['items'])) {
    sendError('items es requerido y debe ser un array', 400);
}

$items = $input['items'];
$coupon_code = $input['coupon_code'] ?? null;
$subtotal = 0;
$discount = 0;

// Validar y calcular totales
$course_ids = [];
foreach ($items as $item) {
    if (!isset($item['course_id']) || !isset($item['price'])) {
        sendError('Cada item debe tener course_id y price', 400);
    }
    $course_ids[] = (int) $item['course_id'];
    $subtotal += (float) $item['price'];
}

// Si hay cupón, validar
if ($coupon_code) {
    $stmt = $conn->prepare('SELECT discount_value, discount_type FROM coupons WHERE code = ? AND active = 1');
    $stmt->execute([$coupon_code]);
    $coupon = $stmt->fetch();

    if ($coupon) {
        if ($coupon['discount_type'] === 'percentage') {
            $discount = $subtotal * ($coupon['discount_value'] / 100);
        } else {
            $discount = $coupon['discount_value'];
        }
    }
}

$total = max(0, $subtotal - $discount);

try {
    $conn->beginTransaction();

    // Crear orden
    $order_number = 'ORD-' . time() . '-' . rand(1000, 9999);
    $stmt = $conn->prepare('
        INSERT INTO orders (user_id, order_number, subtotal, discount, total, coupon_code, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ');
    $stmt->execute([$user['id'], $order_number, $subtotal, $discount, $total, $coupon_code, 'completed']);

    $order_id = $conn->lastInsertId();

    // Crear items de la orden
    foreach ($items as $item) {
        $stmt = $conn->prepare('
            INSERT INTO order_items (order_id, course_id, price_at_purchase, created_at)
            VALUES (?, ?, ?, NOW())
        ');
        $stmt->execute([$order_id, $item['course_id'], $item['price']]);
    }

    $conn->commit();

    // Obtener orden creada
    $stmt = $conn->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$order_id]);
    $order = $stmt->fetch();

    // Obtener items de la orden
    $stmt = $conn->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $stmt->execute([$order_id]);
    $order['items'] = $stmt->fetchAll();

    sendSuccess($order, 'Orden creada correctamente', 201);
} catch (PDOException $e) {
    $conn->rollBack();
    sendError('Error al crear orden', 500, $e->getMessage());
}
