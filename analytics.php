<?php
// analytics.php - Analytics dashboard (simple queries)
require_once __DIR__ . '/db.php';
$pdo = null;
$weeklyInquiries = 0;
$monthlyInquiries = 0;
$totalInquiries = 0;
$popularServices = [];
try {
    $pdo = getPDO();
    // counts
    $stmt = $pdo->query("SELECT COUNT(*) FROM inquiries WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $weeklyInquiries = $stmt->fetchColumn() ?: 0;
    $stmt = $pdo->query("SELECT COUNT(*) FROM inquiries WHERE date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)");
    $monthlyInquiries = $stmt->fetchColumn() ?: 0;
    $stmt = $pdo->query("SELECT COUNT(*) FROM inquiries");
    $totalInquiries = $stmt->fetchColumn() ?: 0;

    // popular services if data exists in inquiries table (service column)
    $stmt = $pdo->query("SELECT service, COUNT(*) AS cnt FROM inquiries WHERE service IS NOT NULL GROUP BY service ORDER BY cnt DESC LIMIT 5");
    $popularServices = $stmt->fetchAll();
} catch (Exception $e) {
    // ignore - show defaults/static content
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fugo Innovation - Analytics</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-100">
    <!-- Admin Navigation -->
    <nav class="bg-gray-900 text-white shadow-lg fixed w-full top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="admin.html" class="flex items-center space-x-2">
                        <span class="text-2xl font-bold text-purple-400">Fugo</span>
                        <span class="text-sm text-gray-300">Admin</span>
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="admin.html" class="nav-link text-gray-300 hover:text-white px-3 py-2 rounded-md">Dashboard</a>
                    <a href="services.php" class="nav-link text-gray-300 hover:text-white px-3 py-2 rounded-md">Services</a>
                    <a href="inquiries.php" class="nav-link text-gray-300 hover:text-white px-3 py-2 rounded-md">Inquiries</a>
                    <a href="analytics.php" class="nav-link text-gray-300 hover:text-white px-3 py-2 rounded-md">Analytics</a>
                </div>
                <div class="flex items-center space-x-3">
                    <a href="index.html" class="hidden sm:inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Logout</a>
                    <button id="mobileMenuBtn" class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none">
                        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div id="mobileMenu" class="md:hidden hidden mt-2 px-2 pb-3 space-y-1">
                <a href="admin.html" class="block nav-link text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">Dashboard</a>
                <a href="services.php" class="block nav-link text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">Services</a>
                <a href="inquiries.php" class="block nav-link text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">Inquiries</a>
                <a href="analytics.php" class="block nav-link text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">Analytics</a>
                <a href="index.html" class="block bg-red-600 text-white px-3 py-2 rounded-md">Logout</a>
            </div>
        </div>
    </nav>
    <script>
        (function(){
            const btn = document.getElementById('mobileMenuBtn');
            const menu = document.getElementById('mobileMenu');
            if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
            const current = location.pathname.split('/').pop();
            document.querySelectorAll('.nav-link').forEach(a => {
                const href = (a.getAttribute('href') || '').split('/').pop();
                if (href === current) {
                    a.classList.remove('text-gray-300');
                    a.classList.add('text-white', 'bg-gray-800');
                }
            });
        })();
    </script>

    <div class="pt-20 min-h-screen">
        <!-- Analytics Section -->
        <div id="adminAnalytics" class="admin-section">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>
                
                <div class="grid md:grid-cols-2 gap-8 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Inquiry Trends</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">This Week</span>
                                <span class="font-bold text-green-600" id="weeklyInquiries"><?php echo htmlspecialchars($weeklyInquiries); ?></span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">This Month</span>
                                <span class="font-bold text-blue-600" id="monthlyInquiries"><?php echo htmlspecialchars($monthlyInquiries); ?></span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Total</span>
                                <span class="font-bold text-purple-600" id="totalInquiriesAnalytics"><?php echo htmlspecialchars($totalInquiries); ?></span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Popular Services</h3>
                        <div class="space-y-3">
                            <?php if (!empty($popularServices)): ?>
                                <?php foreach ($popularServices as $ps): ?>
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600"><?php echo htmlspecialchars($ps['service']); ?></span>
                                        <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"><?php echo htmlspecialchars($ps['cnt']); ?> reqs</span>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Custom Software Development</span>
                                    <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">45%</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Cloud Solutions</span>
                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">30%</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Mobile App Development</span>
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">25%</span>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="admin.js"></script>
</body>
</html>
