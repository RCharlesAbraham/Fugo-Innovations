<?php
// debug_db.php - CLI helper to show DB connection status and a small test query
chdir(__DIR__);
require_once __DIR__ . '/db.php';

echo "Debug DB connection\n";
// Show any stored connect error
if (!empty($GLOBALS['DB_CONNECT_ERROR'])) {
    echo "Stored connect error: " . $GLOBALS['DB_CONNECT_ERROR'] . "\n";
}

try {
    $pdo = getPDO();
    echo "Connected to DB: OK\n";
    // Try a lightweight query depending on existence
    try {
        $res = $pdo->query("SELECT 1 AS ok");
        $row = $res->fetch();
        echo "SELECT 1 => " . json_encode($row) . "\n";
    } catch (Exception $qe) {
        echo "Test query failed: " . $qe->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "getPDO() threw: " . $e->getMessage() . "\n";
}

// Print config for debugging (masked password)
if (file_exists(__DIR__ . '/config.php')) {
    $cfg = require __DIR__ . '/config.php';
    $masked = $cfg;
    if (isset($masked['pass'])) $masked['pass'] = str_repeat('*', min(8, strlen($masked['pass'])));
    echo "Config: " . json_encode($masked) . "\n";
}

// Recommend next steps
echo "\nIf connection failed, check your MySQL server and credentials in config.php. See logs/db-error.log for details.\n";

?>
