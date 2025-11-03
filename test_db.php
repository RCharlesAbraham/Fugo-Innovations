<?php
// test_db.php - simple connection test
require_once __DIR__ . '/db.php';

try {
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT 1');
    $row = $stmt->fetch();
    if ($row) {
        echo "Connection OK. SELECT 1 returned: " . implode(',', $row);
    } else {
        echo "Connection OK, but no rows returned.";
    }
} catch (Exception $e) {
    echo "Connection test failed: " . htmlspecialchars($e->getMessage());
}
