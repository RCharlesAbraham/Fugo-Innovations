<?php
// web_debug.php - lightweight web-facing debug page for local development only
// Shows DB connect error (if any), PHP version, and loaded extensions to help diagnose webserver vs CLI differences.
chdir(__DIR__);
require_once __DIR__ . '/db.php';

header('Content-Type: text/html; charset=utf-8');
echo '<!doctype html><html><head><meta charset="utf-8"><title>Web Debug</title>'; 
echo '<style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:20px} pre{background:#f7f7f7;padding:10px;border-radius:6px;overflow:auto}</style>';
echo '</head><body>';
echo '<h1>Web debug — local development only</h1>';

// DB connect error
if (!empty($GLOBALS['DB_CONNECT_ERROR'])) {
    echo '<h2 style="color:#a00">Stored DB connect error</h2>';
    echo '<pre>' . htmlspecialchars($GLOBALS['DB_CONNECT_ERROR']) . '</pre>';
} else {
    echo '<h2 style="color:green">No stored DB connect error</h2>';
}

// Try getPDO()
echo '<h3>Attempt getPDO()</h3>';
try {
    $pdo = getPDO();
    echo '<div style="color:green">getPDO() succeeded</div>';
} catch (Exception $e) {
    echo '<div style="color:#a00">getPDO() threw: ' . htmlspecialchars($e->getMessage()) . '</div>';
}

// PHP info summary
echo '<h3>PHP information</h3>';
echo '<div><strong>PHP version:</strong> ' . phpversion() . '</div>';
echo '<div><strong>Loaded extensions (partial):</strong> ' . implode(', ', array_slice(get_loaded_extensions(), 0, 50)) . '...</div>';
echo '<div style="margin-top:8px"><strong>PDO drivers:</strong> ' . implode(', ', PDO::getAvailableDrivers()) . '</div>';

echo '<h3>phpinfo()</h3>';
echo '<p>Below is the full phpinfo() output which shows loaded modules and php.ini used. Close this page when finished.</p>';
echo '<div style="border:1px solid #ddd;padding:8px">';
ob_start(); phpinfo(); $p = ob_get_clean();
// Strip out potential remote file paths for privacy — keep full content since this is local dev only
echo $p;
echo '</div>';

echo '</body></html>';

?>
