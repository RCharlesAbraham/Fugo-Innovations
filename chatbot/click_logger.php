<?php
// Simple click logger for chatbot link clicks.
// Appends JSON lines to logs/clicks.log with timestamp, link, page, user agent.

header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    // accept form POSTS too (beacon might send plain body)
    parse_str(file_get_contents('php://input'), $data);
}

$link = isset($data['link']) ? $data['link'] : (isset($data['0']) ? $data['0'] : null);
$page = isset($data['page']) ? $data['page'] : null;
$query = isset($data['query']) ? $data['query'] : null;

$entry = [
    'time' => date('c'),
    'link' => $link,
    'page' => $page,
    'query' => $query,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    'ua' => $_SERVER['HTTP_USER_AGENT'] ?? null
];

$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
$logFile = $logDir . '/clicks.log';
file_put_contents($logFile, json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);

echo json_encode(['ok'=>true]);
exit;
