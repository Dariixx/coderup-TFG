<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/coupons.php';

requireMethod('POST');
$user = requireAuth();
$input = getJsonInput();

$cart = $input['cart'] ?? $input['items'] ?? [];
if (empty($cart) || !is_array($cart)) {
    sendError('cart es requerido y debe ser un array', 400);
}

$courseIds = [];
foreach ($cart as $item) {
    $courseId = $item['course_id'] ?? $item['courseId'] ?? null;
    if (!$courseId) {
        sendError('Cada item debe incluir course_id', 400);
    }
    $courseIds[] = (int) $courseId;
}

$courseIds = array_values(array_unique($courseIds));
$placeholders = implode(',', array_fill(0, count($courseIds), '?'));

$stmt = $conn->prepare("SELECT id, title, price FROM courses WHERE id IN ({$placeholders}) AND is_published = 1");
$stmt->execute($courseIds);
$courses = $stmt->fetchAll();

if (count($courses) !== count($courseIds)) {
    sendError('Algún curso del carrito no existe o no está publicado', 400);
}

$subtotal = 0.0;
foreach ($courses as $course) {
    $subtotal += (float) $course['price'];
}

$itemsCount = count($courses);
$couponCode = isset($input['coupon_code']) && $input['coupon_code'] !== '' ? strtoupper(trim($input['coupon_code'])) : null;
$coupon = $couponCode ? getEligibleCoupon($conn, $couponCode, $itemsCount) : getAutomaticCoupon($conn, $itemsCount);

if ($coupon && $coupon['only_new_users']) {
    $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    if ((int) $stmt->fetch()['total'] > 0) {
        $coupon = null;
    }
}

$discountAmount = calculateCouponDiscount($coupon, $subtotal);
$discountPercent = $coupon && $coupon['discount_type'] !== 'fixed' ? (float) $coupon['discount_value'] : 0.0;
$total = max(0, round($subtotal - $discountAmount, 2));

try {
    $conn->beginTransaction();

    $orderNumber = 'ORD-' . date('Ymd') . '-' . random_int(1000, 9999);
    $stmt = $conn->prepare('
        INSERT INTO orders (user_id, order_number, subtotal, discount_amount, discount_percent, coupon_code, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, "completed")
    ');
    $stmt->execute([
        $user['id'],
        $orderNumber,
        $subtotal,
        $discountAmount,
        $discountPercent,
        $coupon['code'] ?? $couponCode,
        $total,
    ]);

    $orderId = (int) $conn->lastInsertId();
    $enrollments = [];

    foreach ($courses as $course) {
        $stmt = $conn->prepare('
            INSERT INTO order_items (order_id, course_id, price_at_purchase)
            VALUES (?, ?, ?)
        ');
        $stmt->execute([$orderId, $course['id'], $course['price']]);

        $stmt = $conn->prepare('
            INSERT INTO enrollments (user_id, course_id, progress, status)
            VALUES (?, ?, 0, "enrolled")
            ON DUPLICATE KEY UPDATE status = "enrolled"
        ');
        $stmt->execute([$user['id'], $course['id']]);

        $enrollments[] = [
            'course_id' => (int) $course['id'],
            'course_title' => $course['title'],
        ];
    }

    if ($coupon) {
        $stmt = $conn->prepare('UPDATE coupons SET uses = uses + 1 WHERE id = ?');
        $stmt->execute([$coupon['id']]);
    }

    $conn->commit();

    sendSuccess([
        'id' => $orderId,
        'order_number' => $orderNumber,
        'subtotal' => round($subtotal, 2),
        'discount_amount' => $discountAmount,
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

    sendError('Error al crear orden', 500, $error->getMessage());
}
