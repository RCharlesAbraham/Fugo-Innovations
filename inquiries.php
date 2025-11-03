<?php
// inquiries.php - Customer inquiries (DB-backed when available)
require_once __DIR__ . '/db.php';
$pdo = null;
$inquiriesRows = [];
$totalInquiries = 0;
try {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT COUNT(*) FROM inquiries");
    $totalInquiries = $stmt->fetchColumn() ?: 0;

    $stmt2 = $pdo->query("SELECT date, name, email, company, status FROM inquiries ORDER BY date DESC LIMIT 200");
    $inquiriesRows = $stmt2->fetchAll();
} catch (Exception $e) {
    // Missing table or connection - show defaults
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fugo Innovation - Inquiries</title>
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
        <!-- Inquiries Section -->
        <div id="adminInquiries" class="admin-section">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Customer Inquiries</h1>
                    <div class="text-gray-600">Total: <span class="font-bold text-gray-900"><?php echo htmlspecialchars($totalInquiries); ?></span></div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inquiriesTable" class="bg-white divide-y divide-gray-200">
                                <?php if (!empty($inquiriesRows)): ?>
                                    <?php foreach ($inquiriesRows as $inq): ?>
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($inq['date']); ?></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo htmlspecialchars($inq['name']); ?></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($inq['email']); ?></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($inq['company']); ?></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($inq['status']); ?></td>
                                            <td class="px-6 py-4 text-sm text-gray-500">
                                                <a href="#" class="text-blue-600 hover:underline mr-3">View</a>
                                                <a href="#" class="text-green-600 hover:underline">Mark</a>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="6" class="px-6 py-8 text-center text-gray-600">No inquiries found.</td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- View Inquiry Modal -->
    <div id="inquiryModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display: none;">
        <div class="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Inquiry Details</h2>
            <div id="inquiryDetails" class="space-y-4">
                <!-- Inquiry details will be populated by JavaScript -->
            </div>
            <div class="flex gap-4 mt-6">
                <button id="markAsReadBtn" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">Mark as Read</button>
                <button id="closeInquiryModal" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition">Close</button>
            </div>
        </div>
    </div>

    <script src="admin.js"></script>
</body>
</html>
