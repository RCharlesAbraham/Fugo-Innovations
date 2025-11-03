<?php
// services.php - Services management (DB-backed when available)
require_once __DIR__ . '/db.php';
$pdo = null;
$activeServices = 0;
$servicesRows = [];
try {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT COUNT(*) FROM services");
    $activeServices = $stmt->fetchColumn() ?: 0;

    $stmt2 = $pdo->query("SELECT COALESCE(icon,'') AS icon, name, description, status FROM services ORDER BY name ASC");
    $servicesRows = $stmt2->fetchAll();
} catch (Exception $e) {
    // Silent fallback when DB is unavailable
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fugo Innovation - Services</title>
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
        <!-- Services Management Section -->
        <div id="adminServices" class="admin-section">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Manage Services</h1>
                    <a id="addServiceBtn" href="#serviceModal" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">Add New Service</a>
                </div>
                
                <div class="grid md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex items-center">
                            <div class="text-3xl text-green-600 mr-4">✅</div>
                            <div>
                                <p class="text-sm text-gray-600">Active Services</p>
                                <p class="text-2xl font-bold text-gray-900" id="activeServices"><?php echo htmlspecialchars($activeServices); ?></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="servicesTable" class="bg-white divide-y divide-gray-200">
                                <?php if (!empty($servicesRows)): ?>
                                    <?php foreach ($servicesRows as $row): ?>
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center">
                                                    <div class="text-2xl mr-3"><?php echo htmlspecialchars($row['icon']); ?></div>
                                                    <div>
                                                        <div class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($row['name']); ?></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-500"><?php echo htmlspecialchars($row['description']); ?></td>
                                            <td class="px-6 py-4 text-sm text-gray-500"><?php echo htmlspecialchars($row['status']); ?></td>
                                            <td class="px-6 py-4 text-sm text-gray-500">
                                                <a href="#" class="text-blue-600 hover:underline mr-3">Edit</a>
                                                <a href="#" class="text-red-600 hover:underline">Delete</a>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="4" class="px-6 py-8 text-center text-gray-600">No services available.</td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Service Modal (client-side) -->
    <div id="serviceModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display: none;">
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 id="serviceModalTitle" class="text-2xl font-bold text-gray-900 mb-6">Add New Service</h2>
            <form id="serviceForm">
                <div class="mb-4">
                    <label for="serviceName" class="block text-sm font-semibold mb-2">Service Name</label>
                    <input type="text" id="serviceName" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600" required>
                </div>
                <div class="mb-4">
                    <label for="serviceIcon" class="block text-sm font-semibold mb-2">Icon (Emoji)</label>
                    <input type="text" id="serviceIcon" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="💻" required>
                </div>
                <div class="mb-6">
                    <label for="serviceDescription" class="block text-sm font-semibold mb-2">Description</label>
                    <textarea id="serviceDescription" rows="3" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600" required></textarea>
                </div>
                <div class="flex gap-4">
                    <button type="submit" class="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">Save Service</button>
                    <button type="button" id="closeServiceModal" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script src="admin.js"></script>
</body>
</html>
