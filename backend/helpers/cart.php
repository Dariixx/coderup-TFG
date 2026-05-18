<?php

function getCartSessionId() {
    $header = $_SERVER['HTTP_X_CODERUP_CART_SESSION'] ?? '';
    $cookie = $_COOKIE['coderup_cart_session'] ?? '';
    $sessionId = $header ?: $cookie;

    if (!preg_match('/^[a-zA-Z0-9_-]{16,100}$/', $sessionId)) {
        $sessionId = 'cart_' . bin2hex(random_bytes(24));
    }

    setcookie('coderup_cart_session', $sessionId, [
        'expires' => time() + 60 * 60 * 24 * 30,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => false,
        'samesite' => 'None',
    ]);

    header('X-CoderUp-Cart-Session: ' . $sessionId);

    return $sessionId;
}

function ensureCartTable($conn) {
    static $checked = false;
    if ($checked) {
        return;
    }

    $conn->exec("
        CREATE TABLE IF NOT EXISTS cart_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            session_id VARCHAR(100) NOT NULL,
            course_id INT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            UNIQUE KEY unique_cart_course (session_id, course_id),
            INDEX idx_session (session_id),
            INDEX idx_course (course_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $checked = true;
}

function fetchCartPayload($conn, $sessionId, $discountAmount = 0, $couponCode = null) {
    ensureCartTable($conn);

    $stmt = $conn->prepare('
        SELECT
            ci.id,
            ci.course_id,
            c.slug,
            c.title,
            CAST(c.price AS DECIMAL(10,2)) AS price,
            c.thumbnail_url,
            c.level,
            c.is_published,
            c.category_id,
            cat.name AS category_name,
            i.name AS instructor_name
        FROM cart_items ci
        JOIN courses c ON ci.course_id = c.id
        JOIN categories cat ON c.category_id = cat.id
        JOIN instructors i ON c.instructor_id = i.id
        WHERE ci.session_id = ? AND c.is_published = 1
        ORDER BY ci.added_at DESC
    ');
    $stmt->execute([$sessionId]);
    $items = $stmt->fetchAll();

    $subtotal = 0.0;
    foreach ($items as &$item) {
        $item['id'] = (int) $item['id'];
        $item['course_id'] = (int) $item['course_id'];
        $item['price'] = (float) $item['price'];
        $subtotal += $item['price'];
    }

    $discountAmount = min($subtotal, max(0, (float) $discountAmount));
    $total = max(0, round($subtotal - $discountAmount, 2));

    return [
        'items' => $items,
        'count' => count($items),
        'subtotal' => round($subtotal, 2),
        'discount' => round($discountAmount, 2),
        'coupon_code' => $couponCode,
        'total' => $total,
        'session_id' => $sessionId,
    ];
}
