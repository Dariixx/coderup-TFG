<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/coupons.php';

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
