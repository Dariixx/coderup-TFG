<?php

function getEligibleCoupon($conn, $code, $itemsCount) {
    $stmt = $conn->prepare('
        SELECT *
        FROM coupons
        WHERE code = ?
          AND active = 1
          AND min_items <= ?
          AND (max_items IS NULL OR max_items >= ?)
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses = -1 OR uses < max_uses)
        LIMIT 1
    ');
    $stmt->execute([strtoupper(trim($code)), $itemsCount, $itemsCount]);
    return $stmt->fetch() ?: null;
}

function getAutomaticCoupon($conn, $itemsCount) {
    $stmt = $conn->prepare('
        SELECT *
        FROM coupons
        WHERE discount_type = "buy_x_get_discount"
          AND active = 1
          AND min_items <= ?
          AND (max_items IS NULL OR max_items >= ?)
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses = -1 OR uses < max_uses)
        ORDER BY discount_value DESC
        LIMIT 1
    ');
    $stmt->execute([$itemsCount, $itemsCount]);
    return $stmt->fetch() ?: null;
}

function calculateCouponDiscount($coupon, $subtotal) {
    if (!$coupon) {
        return 0.0;
    }

    if ($coupon['discount_type'] === 'fixed') {
        return min($subtotal, (float) $coupon['discount_value']);
    }

    return round($subtotal * ((float) $coupon['discount_value'] / 100), 2);
}
