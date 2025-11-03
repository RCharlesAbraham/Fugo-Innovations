// Fugo Innovation - Admin Dashboard JavaScript

// Application State
let currentAdminSection = 'dashboard';
let services = [];
let inquiries = [];
let currentEditingService = null;
let currentViewingInquiry = null;

// Load data from localStorage
function loadData() {
    const savedServices = localStorage.getItem('fugoServices');
    if (savedServices) {
        services = JSON.parse(savedServices);
    } else {
        services = [
            {
                id: 1,
                name: 'Custom Software Development',
                icon: '💻',
                description: 'Tailored software solutions built with modern frameworks and best practices to meet your unique business requirements.',
                status: 'active',
                color: 'blue'
            },
            {
                id: 2,
                name: 'Cloud Solutions',
                icon: '☁️',
                description: 'Scalable cloud infrastructure, migration services, and DevOps implementation for optimal performance.',
                status: 'active',
                color: 'purple'
            },
            {
                id: 3,
                name: 'Mobile App Development',
                icon: '📱',
                description: 'Native and cross-platform mobile applications for iOS and Android with seamless user experiences.',
                status: 'active',
                color: 'green'
            },
            {
                id: 4,
                name: 'AI & Machine Learning',
                icon: '🤖',
                description: 'Intelligent automation, predictive analytics, and AI-powered solutions to transform your business.',
                status: 'active',
                color: 'orange'
            },
            {
                id: 5,
                name: 'Web Development',
                icon: '🌐',
                description: 'Modern, responsive websites and web applications using latest technologies and frameworks.',
                status: 'active',
                color: 'pink'
            },
            {
                id: 6,
                name: 'Cybersecurity',
                icon: '🔒',
                description: 'Comprehensive security solutions to protect your digital assets and ensure compliance.',
                status: 'active',
                color: 'indigo'
            }
        ];
        saveServices();
    }

    const savedInquiries = localStorage.getItem('fugoInquiries');
    inquiries = savedInquiries ? JSON.parse(savedInquiries) : [];
}

function saveServices() {
    localStorage.setItem('fugoServices', JSON.stringify(services));
}

function saveInquiries() {
    localStorage.setItem('fugoInquiries', JSON.stringify(inquiries));
}

// Initialize Application
function init() {
    loadData();
    updateDashboardStats();
    renderServicesTable();
    renderInquiriesTable();
    updateAnalytics();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Admin navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            showAdminSection(section);
        });
    });
    // Service management (guard elements because admin.js is included on multiple pages)
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) addServiceBtn.addEventListener('click', () => showServiceModal());

    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) serviceForm.addEventListener('submit', handleServiceSubmit);

    const closeServiceModalBtn = document.getElementById('closeServiceModal');
    if (closeServiceModalBtn) closeServiceModalBtn.addEventListener('click', hideServiceModal);

    // Inquiry modal
    const closeInquiryModalBtn = document.getElementById('closeInquiryModal');
    if (closeInquiryModalBtn) closeInquiryModalBtn.addEventListener('click', hideInquiryModal);

    const markAsReadBtn = document.getElementById('markAsReadBtn');
    if (markAsReadBtn) markAsReadBtn.addEventListener('click', markInquiryAsRead);
}

// View Management
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.style.display = 'none';
    });
    const targetSection = document.getElementById(`admin${section.charAt(0).toUpperCase() + section.slice(1)}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    currentAdminSection = section;
}

// Services Management
function renderServicesTable() {
    const servicesTable = document.getElementById('servicesTable');
    if (!servicesTable) return;
    servicesTable.innerHTML = services.map(service => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${service.icon}</span>
                    <span class="text-sm font-medium text-gray-900">${service.name}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${service.description.substring(0, 100)}...</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${service.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editService(${service.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                <button onclick="toggleServiceStatus(${service.id})" class="text-${service.status === 'active' ? 'red' : 'green'}-600 hover:text-${service.status === 'active' ? 'red' : 'green'}-900">
                    ${service.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        </tr>
    `).join('');
}

function showServiceModal(service = null) {
    currentEditingService = service;
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const form = document.getElementById('serviceForm');

    if (service) {
        title.textContent = 'Edit Service';
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceIcon').value = service.icon;
        document.getElementById('serviceDescription').value = service.description;
    } else {
        title.textContent = 'Add New Service';
        form.reset();
    }

    modal.style.display = 'flex';
}

function hideServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
    currentEditingService = null;
}

function handleServiceSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('serviceName').value;
    const icon = document.getElementById('serviceIcon').value;
    const description = document.getElementById('serviceDescription').value;

    if (currentEditingService) {
        const index = services.findIndex(s => s.id === currentEditingService.id);
        services[index] = { ...services[index], name, icon, description };
    } else {
        const newService = {
            id: Date.now(),
            name,
            icon,
            description,
            status: 'active',
            color: ['blue', 'purple', 'green', 'orange', 'pink', 'indigo'][Math.floor(Math.random() * 6)]
        };
        services.push(newService);
    }

    saveServices();
    renderServicesTable();
    updateDashboardStats();
    hideServiceModal();
}

function editService(id) {
    const service = services.find(s => s.id === id);
    showServiceModal(service);
}

function toggleServiceStatus(id) {
    const service = services.find(s => s.id === id);
    service.status = service.status === 'active' ? 'inactive' : 'active';
    saveServices();
    renderServicesTable();
    updateDashboardStats();
}

// Inquiries Management
function renderInquiriesTable() {
    const inquiriesTable = document.getElementById('inquiriesTable');
    if (!inquiriesTable) return;
    if (inquiries.length === 0) {
        inquiriesTable.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">No inquiries yet</td>
            </tr>
        `;
        return;
    }

    inquiriesTable.innerHTML = inquiries.map(inquiry => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${new Date(inquiry.date).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${inquiry.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${inquiry.email}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${inquiry.company || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inquiry.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${inquiry.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewInquiry(${inquiry.id})" class="text-indigo-600 hover:text-indigo-900">View</button>
            </td>
        </tr>
    `).join('');
}

function viewInquiry(id) {
    currentViewingInquiry = inquiries.find(i => i.id === id);
    const modal = document.getElementById('inquiryModal');
    const details = document.getElementById('inquiryDetails');
    if (!modal || !details || !currentViewingInquiry) return;

    details.innerHTML = `
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-gray-700">Name</label>
                <p class="text-gray-900">${currentViewingInquiry.name}</p>
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700">Email</label>
                <p class="text-gray-900">${currentViewingInquiry.email}</p>
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700">Company</label>
                <p class="text-gray-900">${currentViewingInquiry.company || 'N/A'}</p>
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700">Date</label>
                <p class="text-gray-900">${new Date(currentViewingInquiry.date).toLocaleString()}</p>
            </div>
        </div>
        <div class="mt-4">
            <label class="block text-sm font-semibold text-gray-700">Message</label>
            <p class="text-gray-900 bg-gray-50 p-4 rounded-lg mt-2">${currentViewingInquiry.message}</p>
        </div>
    `;

    modal.style.display = 'flex';
}

function hideInquiryModal() {
    const modal = document.getElementById('inquiryModal');
    if (modal) modal.style.display = 'none';
    currentViewingInquiry = null;
}

function markInquiryAsRead() {
    if (currentViewingInquiry) {
        currentViewingInquiry.status = 'read';
        saveInquiries();
        renderInquiriesTable();
        updateDashboardStats();
        hideInquiryModal();
    }
}

// Dashboard and Analytics
function updateDashboardStats() {
    const totalEl = document.getElementById('totalInquiries');
    if (totalEl) totalEl.textContent = inquiries.length;

    const activeEl = document.getElementById('activeServices');
    if (activeEl) activeEl.textContent = services.filter(s => s.status === 'active').length;

    const newThisMonthEl = document.getElementById('newThisMonth');
    if (newThisMonthEl) {
        newThisMonthEl.textContent = inquiries.filter(i => {
            const inquiryDate = new Date(i.date);
            const now = new Date();
            return inquiryDate.getMonth() === now.getMonth() && inquiryDate.getFullYear() === now.getFullYear();
        }).length;
    }

    // Update recent inquiries
    const recentInquiries = document.getElementById('recentInquiries');
    if (recentInquiries) {
        if (inquiries.length === 0) {
            recentInquiries.innerHTML = '<p class="text-gray-600">No inquiries yet</p>';
        } else {
            recentInquiries.innerHTML = inquiries.slice(0, 3).map(inquiry => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium text-gray-900">${inquiry.name}</p>
                        <p class="text-sm text-gray-600">${inquiry.email}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${inquiry.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${inquiry.status}
                    </span>
                </div>
            `).join('');
        }
    }
}

function updateAnalytics() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    const weeklyCount = inquiries.filter(i => new Date(i.date) >= weekAgo).length;
    const monthlyCount = inquiries.filter(i => new Date(i.date) >= monthAgo).length;

    const weeklyEl = document.getElementById('weeklyInquiries');
    if (weeklyEl) weeklyEl.textContent = weeklyCount;
    const monthlyEl = document.getElementById('monthlyInquiries');
    if (monthlyEl) monthlyEl.textContent = monthlyCount;
    const totalAnalyticsEl = document.getElementById('totalInquiriesAnalytics');
    if (totalAnalyticsEl) totalAnalyticsEl.textContent = inquiries.length;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
