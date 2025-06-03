// DOM Elements
const sidebarBtn = document.querySelector('.sidebarBtn');
const sidebar = document.querySelector('.sidebar');
const profileToggle = document.getElementById('profileToggle');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const transactionType = document.getElementById('type');
const categorySelect = document.getElementById('category');
const filterCategory = document.getElementById('categoryFilter');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error initializing application. Please refresh the page.', 'error');
    }
});

function initializeApp() {
    // Check authentication first
    if (!UserManager.isLoggedIn() && requiresAuth()) {
        window.location.href = 'login.html';
        return;
    }

    // Setup event listeners
    setupEventListeners();
    
    // Load user profile
    loadUserProfile();
    
    // Update dashboard if on dashboard page
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        updateDashboard();
    }

    // Initialize categories
    populateCategories();

    // Initialize settings
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    
    // Apply font size
    applyFontSize(settings.fontSize || 'medium');
    
    // Update any displayed amounts and dates
    updateDashboard();
}

function requiresAuth() {
    const publicPages = ['login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return !publicPages.includes(currentPage);
}

function setupEventListeners() {
    try {
        // Sidebar toggle
        if (sidebarBtn) {
            sidebarBtn.addEventListener('click', () => {
                sidebar.classList.toggle('close');
            });
        }

        // Profile dropdown toggle
        if (profileToggle) {
            profileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (profileDropdown && !profileDropdown.contains(e.target) && !profileToggle.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await handleLogout();
            });
        }

        // Help button
        const helpButton = document.querySelector('.dropdown-item[href="help.html"]');
        if (helpButton) {
            helpButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'help.html';
            });
        }

        // Transaction type change event
        if (transactionType) {
            transactionType.addEventListener('change', function() {
                updateCategories(this.value);
            });
        }

        // Add keyboard navigation for dropdown
        if (profileDropdown) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && profileDropdown.classList.contains('active')) {
                    profileDropdown.classList.remove('active');
                }
            });
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

function populateCategories() {
    try {
        if (categorySelect) {
            const type = transactionType ? transactionType.value : 'expense';
            updateCategories(type);
        }

        if (filterCategory) {
            filterCategory.innerHTML = '<option value="">All Categories</option>';
            const allCategories = [...categories.income, ...categories.expense];
            const uniqueCategories = [...new Set(allCategories)];
            
            uniqueCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                filterCategory.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error populating categories:', error);
        showNotification('Error loading categories', 'error');
    }
}

function updateCategories(type) {
    try {
        if (!categorySelect) return;
        
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        const categoryList = type === 'income' ? categories.income : categories.expense;
        
        categoryList.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error updating categories:', error);
    }
}

function loadUserProfile() {
    try {
        const user = UserManager.getUser();
        if (!user) {
            if (requiresAuth()) {
                window.location.href = 'login.html';
            }
            return;
        }

        // Update profile elements
        updateProfileElements(user);
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

function updateProfileElements(user) {
    try {
        // Update all profile images
        const profileImages = document.querySelectorAll('#profileImage, .dropdown-header img');
        profileImages.forEach(img => {
            if (img) {
                img.src = user.imageUrl || 'contents/default_pp.jpg';
                img.onerror = function() {
                    this.src = 'contents/default_pp.jpg';
                };
            }
        });

        // Update username
        const userNameElements = document.querySelectorAll('#userName, #dropdownUserName');
        userNameElements.forEach(el => {
            if (el) el.textContent = user.name || 'User';
        });

        // Update email
        const userEmailElement = document.getElementById('dropdownUserEmail');
        if (userEmailElement) {
            userEmailElement.textContent = user.email || '';
            userEmailElement.title = user.email || ''; // Add tooltip for long emails
        }
    } catch (error) {
        console.error('Error updating profile elements:', error);
    }
}

async function handleLogout() {
    try {
        if (confirm('Are you sure you want to logout?')) {
            UserManager.logout();
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error logging out. Please try again.', 'error');
    }
}

function updateDashboard() {
    try {
        const elements = {
            totalIncome: document.getElementById('totalIncome'),
            totalExpenses: document.getElementById('totalExpenses'),
            balance: document.getElementById('balance'),
            monthlyNet: document.getElementById('monthlyNet')
        };

        if (Object.values(elements).some(el => el)) {
            const transactions = TransactionManager.getTransactions();
            const totals = calculateTotals(transactions);
            updateDashboardElements(elements, totals);
        }
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showNotification('Error updating dashboard data', 'error');
    }
}

function calculateTotals(transactions) {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
    };
}

function updateDashboardElements(elements, totals) {
    if (elements.totalIncome) elements.totalIncome.textContent = formatCurrency(totals.totalIncome);
    if (elements.totalExpenses) elements.totalExpenses.textContent = formatCurrency(totals.totalExpenses);
    if (elements.balance) elements.balance.textContent = formatCurrency(totals.balance);
    if (elements.monthlyNet) elements.monthlyNet.textContent = formatCurrency(totals.balance);
}

function formatCurrency(amount) {
    try {
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'IDR': 'Rp'
        };

        const symbol = currencySymbols[settings.currency] || '$';
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return settings.currency === 'IDR' 
            ? `${symbol} ${formatter.format(amount)}`
            : `${symbol}${formatter.format(amount)}`;
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `$${amount.toFixed(2)}`;
    }
}

function showNotification(message, type = 'info') {
    try {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Add settings change listener
window.addEventListener('settingsChanged', function(e) {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    switch(e.detail.type) {
        case 'theme':
            document.documentElement.setAttribute('data-theme', settings.theme);
            break;
        case 'currency':
            // Refresh any displayed amounts
            updateDashboard();
            break;
        case 'dateFormat':
            // Refresh any displayed dates
            updateDashboard();
            break;
        case 'fontSize':
            applyFontSize(settings.fontSize);
            break;
    }
});

function applyFontSize(size) {
    const fontSizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
    };
    document.documentElement.style.setProperty('--font-size-base', fontSizes[size]);
}

function formatDate(dateString) {
    try {
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        const date = new Date(dateString);
        
        switch(settings.dateFormat) {
            case 'DD/MM/YYYY':
                return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            case 'YYYY-MM-DD':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            default: // MM/DD/YYYY
                return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Export functions that need to be accessed globally
window.handleLogout = handleLogout;
window.showNotification = showNotification;
