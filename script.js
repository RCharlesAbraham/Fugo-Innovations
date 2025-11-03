// Fugo Innovation - Main JavaScript

// Application State
let isAdminMode = false;
let currentAdminSection = 'dashboard';
let services = [
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
let inquiries = [];
let currentEditingService = null;
let currentViewingInquiry = null;

// DOM Elements
const publicContent = document.getElementById('publicContent');
const adminContent = document.getElementById('adminContent');
const publicNav = document.getElementById('publicNav');
const adminNav = document.getElementById('adminNav');
const adminLoginModal = document.getElementById('adminLoginModal');
const serviceModal = document.getElementById('serviceModal');
const inquiryModal = document.getElementById('inquiryModal');

// Initialize Application
function init() {
    renderServices();
    updateDashboardStats();
    renderServicesTable();
    renderInquiriesTable();
    updateAnalytics();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    });

    // Admin login buttons
    document.getElementById('adminLoginBtn').addEventListener('click', showAdminLogin);
    document.getElementById('mobileAdminBtn').addEventListener('click', showAdminLogin);

    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('closeLoginModal').addEventListener('click', hideAdminLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Admin navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            showAdminSection(section);
        });
    });

    // Service management
    document.getElementById('addServiceBtn').addEventListener('click', () => showServiceModal());
    document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
    document.getElementById('closeServiceModal').addEventListener('click', hideServiceModal);

    // Inquiry modal
    document.getElementById('closeInquiryModal').addEventListener('click', hideInquiryModal);
    document.getElementById('markAsReadBtn').addEventListener('click', markInquiryAsRead);

    // Contact form
    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target && !isAdminMode) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('mobileMenu').classList.add('hidden');
            }
        });
    });
}

// Admin Authentication
function showAdminLogin() {
    adminLoginModal.style.display = 'flex';
}

function hideAdminLogin() {
    adminLoginModal.style.display = 'none';
    document.getElementById('adminLoginForm').reset();
    document.getElementById('loginError').classList.add('hidden');
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === 'admin' && password === 'admin123') {
        isAdminMode = true;
        hideAdminLogin();
        showAdminDashboard();
    } else {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = 'Invalid credentials. Try admin/admin123';
        errorDiv.classList.remove('hidden');
    }
}

function logout() {
    isAdminMode = false;
    showPublicSite();
}

// View Management
function showAdminDashboard() {
    publicContent.style.display = 'none';
    adminContent.style.display = 'block';
    publicNav.style.display = 'none';
    adminNav.style.display = 'block';
    showAdminSection('dashboard');
}

function showPublicSite() {
    publicContent.style.display = 'block';
    adminContent.style.display = 'none';
    publicNav.style.display = 'block';
    adminNav.style.display = 'none';
}

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
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = services.filter(service => service.status === 'active').map(service => `
        <div class="bg-gradient-to-br from-${service.color}-50 to-${service.color}-100 p-8 rounded-xl card-hover">
            <div class="text-4xl mb-4">${service.icon}</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">${service.name}</h3>
            <p class="text-gray-700">${service.description}</p>
        </div>
    `).join('');
}

function renderServicesTable() {
    const servicesTable = document.getElementById('servicesTable');
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

    renderServices();
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
    renderServices();
    renderServicesTable();
    updateDashboardStats();
}

// Inquiries Management
function renderInquiriesTable() {
    const inquiriesTable = document.getElementById('inquiriesTable');
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
    document.getElementById('inquiryModal').style.display = 'none';
    currentViewingInquiry = null;
}

function markInquiryAsRead() {
    if (currentViewingInquiry) {
        currentViewingInquiry.status = 'read';
        renderInquiriesTable();
        updateDashboardStats();
        hideInquiryModal();
    }
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const message = document.getElementById('message').value;
    
    const inquiry = {
        id: Date.now(),
        name,
        email,
        company,
        message,
        date: new Date().toISOString(),
        status: 'unread'
    };
    
    inquiries.unshift(inquiry);
    
    const formMessage = document.getElementById('formMessage');
    formMessage.classList.remove('hidden');
    formMessage.className = 'mt-4 text-center p-4 bg-green-100 text-green-800 rounded-lg';
    formMessage.textContent = `Thank you, ${name}! We've received your message and will get back to you soon at ${email}.`;
    
    document.getElementById('contactForm').reset();
    
    updateDashboardStats();
    renderInquiriesTable();
    updateAnalytics();
    
    setTimeout(() => {
        formMessage.classList.add('hidden');
    }, 5000);
}

// Dashboard and Analytics
function updateDashboardStats() {
    document.getElementById('totalInquiries').textContent = inquiries.length;
    document.getElementById('activeServices').textContent = services.filter(s => s.status === 'active').length;
    document.getElementById('newThisMonth').textContent = inquiries.filter(i => {
        const inquiryDate = new Date(i.date);
        const now = new Date();
        return inquiryDate.getMonth() === now.getMonth() && inquiryDate.getFullYear() === now.getFullYear();
    }).length;

    // Update recent inquiries
    const recentInquiries = document.getElementById('recentInquiries');
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

function updateAnalytics() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    const weeklyCount = inquiries.filter(i => new Date(i.date) >= weekAgo).length;
    const monthlyCount = inquiries.filter(i => new Date(i.date) >= monthAgo).length;

    document.getElementById('weeklyInquiries').textContent = weeklyCount;
    document.getElementById('monthlyInquiries').textContent = monthlyCount;
    document.getElementById('totalInquiriesAnalytics').textContent = inquiries.length;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
