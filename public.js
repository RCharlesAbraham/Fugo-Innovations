// Fugo Innovation - Public Site JavaScript

// Application State
let services = [];

// Load services from localStorage or use defaults
function loadServices() {
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
    }
}

// Initialize Application
function init() {
    loadServices();
    renderServices();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.toggle('hidden');
        });
    }

    // Admin login buttons
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const mobileAdminBtn = document.getElementById('mobileAdminBtn');
    if (adminLoginBtn) adminLoginBtn.addEventListener('click', showAdminLogin);
    if (mobileAdminBtn) mobileAdminBtn.addEventListener('click', showAdminLogin);

    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    const closeLoginModal = document.getElementById('closeLoginModal');
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', hideAdminLogin);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            }
        });
    });
}

// Admin Authentication
function showAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.style.display = 'flex';
}

function hideAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.style.display = 'none';
    
    const form = document.getElementById('adminLoginForm');
    if (form) form.reset();
    
    const loginError = document.getElementById('loginError');
    if (loginError) loginError.classList.add('hidden');
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === 'admin' && password === 'admin123') {
        // Redirect to admin page
        window.location.href = 'admin.html';
    } else {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = 'Invalid credentials. Try admin/admin123';
            errorDiv.classList.remove('hidden');
        }
    }
}

// Services Management
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = services.filter(service => service.status === 'active').map(service => `
        <div class="bg-gradient-to-br from-${service.color}-50 to-${service.color}-100 p-8 rounded-xl card-hover">
            <div class="text-4xl mb-4">${service.icon}</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">${service.name}</h3>
            <p class="text-gray-700">${service.description}</p>
        </div>
    `).join('');
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
    
    // Save to localStorage
    let inquiries = JSON.parse(localStorage.getItem('fugoInquiries') || '[]');
    inquiries.unshift(inquiry);
    localStorage.setItem('fugoInquiries', JSON.stringify(inquiries));
    
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.classList.remove('hidden');
        formMessage.className = 'mt-4 text-center p-4 bg-green-100 text-green-800 rounded-lg';
        formMessage.textContent = `Thank you, ${name}! We've received your message and will get back to you soon at ${email}.`;
    }
    
    document.getElementById('contactForm').reset();
    
    setTimeout(() => {
        if (formMessage) formMessage.classList.add('hidden');
    }, 5000);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
