<?php
// db.php - PDO connection helper
// Usage: require_once __DIR__ . '/db.php'; $pdo = getPDO();

$config = require __DIR__ . '/config.php';
$dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";

try {
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    // Do not exit here. Let the requiring script decide how to handle a missing DB.
    // Store the error message in a global so callers can access or log it if needed.
    $pdo = null;
    $GLOBALS['DB_CONNECT_ERROR'] = $e->getMessage();
}

function getPDO()
{
    global $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    // If no connection is available, throw so callers can catch and handle it.
    $msg = isset($GLOBALS['DB_CONNECT_ERROR']) ? $GLOBALS['DB_CONNECT_ERROR'] : 'No database connection available.';
    throw new Exception('Database connection unavailable: ' . $msg);
}
