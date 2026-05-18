<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../helpers/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/coupons.php';
require_once __DIR__ . '/../../helpers/cart.php';

requireMethod('POST');

$user = requireAuth();
$input = getJsonInput();
$sessionId = getCartSessionId();
$couponCode = isset($input['coupon_code']) && $input['coupon_code'] !== '' ? strtoupper(trim($input['coupon_code'])) : null;

ensureCartTable($conn);

try {
    $stmt = $conn->prepare('
        SELECT c.id, c.title, c.price
        FROM cart_items ci
        JOIN courses c ON ci.course_id = c.id
        WHERE ci.session_id = ? AND c.is_published = 1
    ');
    $stmt->execute([$sessionId]);
    $items = $stmt->fetchAll();

    if (empty($items)) {
        sendError('Carrito vacío', 400);
    }

    $subtotal = 0.0;
    foreach ($items as $item) {
        $subtotal += (float) $item['price'];
    }

    $coupon = $couponCode ? getEligibleCoupon($conn, $couponCode, count($items)) : null;
    if ($couponCode && !$coupon) {
        sendError('Cupón inválido o expirado', 400);
    }

    if ($coupon && $coupon['only_new_users']) {
        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        if ((int) $stmt->fetch()['total'] > 0) {
            sendError('Este cupón solo está disponible para nuevos usuarios', 400);
        }
    }

    $discount = calculateCouponDiscount($coupon, $subtotal);
    $discountPercent = $coupon && $coupon['discount_type'] !== 'fixed' ? (float) $coupon['discount_value'] : 0.0;
    $total = max(0, round($subtotal - $discount, 2));

    $conn->beginTransaction();

    $orderNumber = 'ORD-' . date('Ymd') . '-' . random_int(1000, 9999);
    $stmt = $conn->prepare('
        INSERT INTO orders (user_id, order_number, subtotal, discount_amount, discount_percent, coupon_code, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, "completed")
    ');
    $stmt->execute([
        $user['id'],
        $orderNumber,
        round($subtotal, 2),
        $discount,
        $discountPercent,
        $coupon['code'] ?? $couponCode,
        $total,
    ]);

    $orderId = (int) $conn->lastInsertId();
    $enrollments = [];

    foreach ($items as $item) {
        $stmt = $conn->prepare('INSERT INTO order_items (order_id, course_id, price_at_purchase) VALUES (?, ?, ?)');
        $stmt->execute([$orderId, $item['id'], $item['price']]);

        $stmt = $conn->prepare('
            INSERT INTO enrollments (user_id, course_id, progress, status)
            VALUES (?, ?, 0, "enrolled")
            ON DUPLICATE KEY UPDATE status = "enrolled"
        ');
        $stmt->execute([$user['id'], $item['id']]);

        $enrollments[] = [
            'course_id' => (int) $item['id'],
            'course_title' => $item['title'],
        ];
    }

    if ($coupon) {
        $stmt = $conn->prepare('UPDATE coupons SET uses = uses + 1 WHERE id = ?');
        $stmt->execute([$coupon['id']]);
    }

    $stmt = $conn->prepare('DELETE FROM cart_items WHERE session_id = ?');
    $stmt->execute([$sessionId]);

    $conn->commit();

    sendSuccess([
        'id' => $orderId,
        'order_number' => $orderNumber,
        'subtotal' => round($subtotal, 2),
        'discount_amount' => $discount,
        'discount_percent' => $discountPercent,
        'coupon_code' => $coupon['code'] ?? $couponCode,
        'total' => $total,
        'status' => 'completed',
        'enrollments' => $enrollments,
    ], 'Orden creada correctamente', 201);
} catch (Throwable $error) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    sendError('Error al procesar orden', 500, $error->getMessage());
}
