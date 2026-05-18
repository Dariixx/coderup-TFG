<?php

function ensureDefaultCoupons($conn) {
    $conn->exec("
        CREATE TABLE IF NOT EXISTS coupons (
            id INT PRIMARY KEY AUTO_INCREMENT,
            code VARCHAR(50) NOT NULL UNIQUE,
            description VARCHAR(255),
            discount_type ENUM('percentage', 'fixed', 'buy_x_get_discount') DEFAULT 'percentage',
            discount_value DECIMAL(10,2) NOT NULL,
            min_items INT DEFAULT 1,
            max_items INT DEFAULT NULL,
            max_uses INT DEFAULT -1,
            uses INT DEFAULT 0,
            only_new_users BOOLEAN DEFAULT FALSE,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NULL,
            INDEX idx_code (code),
            INDEX idx_active (active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $stmt = $conn->prepare('
        INSERT INTO coupons (code, description, discount_type, discount_value, min_items, max_items, max_uses, uses, only_new_users, active, expires_at)
        VALUES (?, ?, ?, ?, ?, NULL, -1, 0, ?, TRUE, ?)
        ON DUPLICATE KEY UPDATE
            description = VALUES(description),
            discount_type = VALUES(discount_type),
            discount_value = VALUES(discount_value),
            min_items = VALUES(min_items),
            only_new_users = VALUES(only_new_users),
            active = TRUE
    ');

    $stmt->execute(['WELCOME20', 'Descuento 20% primera compra', 'percentage', 20.00, 1, 1, null]);
    $stmt->execute(['SUMMER10', 'Descuento verano 10%', 'percentage', 10.00, 1, 0, date('Y-m-d H:i:s', strtotime('+6 months'))]);
}

function getEligibleCoupon($conn, $code, $itemsCount) {
    ensureDefaultCoupons($conn);

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
    ensureDefaultCoupons($conn);

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
