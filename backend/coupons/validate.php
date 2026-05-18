<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/coupons.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('POST');

$input = getJsonInput();
$code = strtoupper(trim($input['code'] ?? ''));
$itemsCount = max(0, (int) ($input['items_count'] ?? 0));

if ($code === '') {
    $coupon = getAutomaticCoupon($conn, $itemsCount);
} else {
    $coupon = getEligibleCoupon($conn, $code, $itemsCount);
}

if (!$coupon) {
    sendSuccess([
        'valid' => false,
        'message' => 'Cupón no válido para este carrito',
    ], 'Cupón no válido');
}

$user = getCurrentUser();
if ($user && !empty($coupon['only_new_users'])) {
    $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    if ((int) $stmt->fetch()['total'] > 0) {
        sendSuccess([
            'valid' => false,
            'message' => 'WELCOME20 solo está disponible antes de tu primera compra',
        ], 'Cupón no válido');
    }
}

$label = $coupon['discount_type'] === 'fixed'
    ? number_format((float) $coupon['discount_value'], 2) . '€ descuento'
    : (float) $coupon['discount_value'] . '% descuento';

sendSuccess([
    'valid' => true,
    'code' => $coupon['code'],
    'discount_type' => $coupon['discount_type'],
    'discount_value' => (float) $coupon['discount_value'],
    'min_items' => (int) $coupon['min_items'],
    'message' => 'Cupón aplicado: ' . $label,
], 'Cupón aplicado');
