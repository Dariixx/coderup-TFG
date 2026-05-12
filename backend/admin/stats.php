<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../helpers/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

requireMethod('GET');
$user = requireRole('admin');

// Estadísticas
$stmt = $conn->prepare('SELECT COUNT(*) as count FROM users');
$stmt->execute();
$totalUsers = $stmt->fetch()['count'];

$stmt = $conn->prepare('SELECT COUNT(*) as count FROM courses');
$stmt->execute();
$totalCourses = $stmt->fetch()['count'];

$stmt = $conn->prepare('SELECT COUNT(*) as count FROM orders');
$stmt->execute();
$totalOrders = $stmt->fetch()['count'];

$stmt = $conn->prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders');
$stmt->execute();
$totalRevenue = $stmt->fetch()['total'];

$stmt = $conn->prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
$stmt->execute(['admin']);
$totalAdmins = $stmt->fetch()['count'];

sendSuccess([
    'totalUsers' => (int) $totalUsers,
    'totalCourses' => (int) $totalCourses,
    'totalOrders' => (int) $totalOrders,
    'totalRevenue' => (float) $totalRevenue,
    'totalAdmins' => (int) $totalAdmins,
], 'Admin stats retrieved');
