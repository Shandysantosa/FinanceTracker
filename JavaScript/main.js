// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const transactionType = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const descriptionInput = document.getElementById('description');
const transactionTableBody = document.getElementById('transactionList');
const filterType = document.getElementById('typeFilter');
const filterCategory = document.getElementById('categoryFilter');
const startDateFilter = document.getElementById('startDate');
const endDateFilter = document.getElementById('endDate');
const sidebarBtn = document.querySelector('.sidebarBtn');
const sidebar = document.querySelector('.sidebar');

// Profile dropdown elements
const profileToggle = document.getElementById('profileToggle');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard elements
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const balanceEl = document.getElementById('balance');
const monthlyNetEl = document.getElementById('monthlyNet');
const recentTransactionsEl = document.getElementById('recentTransactions');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize date input with today's date
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateDashboard();
    updateTransactionTable();
    loadUserProfile();
    populateCategories();
}

function setupEventListeners() {
    // Sidebar toggle
    if (sidebarBtn) {
        sidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('close');
        });
    }

    // Profile dropdown
    if (profileToggle) {
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleProfileDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (profileDropdown && !profileDropdown.contains(e.target) && !profileToggle.contains(e.target)) {
            closeProfileDropdown();
        }
    });

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // Transaction form submission
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }

    // Transaction type change
    if (transactionType) {
        transactionType.addEventListener('change', function() {
            updateCategories(this.value);
        });
    }

    // Filter change events
    if (filterType) filterType.addEventListener('change', updateTransactionTable);
    if (filterCategory) filterCategory.addEventListener('change', updateTransactionTable);
    if (startDateFilter) startDateFilter.addEventListener('change', updateTransactionTable);
    if (endDateFilter) endDateFilter.addEventListener('change', updateTransactionTable);
}

// Profile dropdown functions
function toggleProfileDropdown() {
    profileToggle.classList.toggle('active');
    profileDropdown.classList.toggle('active');
}

function closeProfileDropdown() {
    profileToggle.classList.remove('active');
    profileDropdown.classList.remove('active');
}

function loadUserProfile() {
    const user = UserManager.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.name || 'Thomas';
        document.getElementById('dropdownUserName').textContent = user.name || 'Thomas';
        document.getElementById('dropdownUserEmail').textContent = user.email || 'thomas@site.com';
        
        if (user.imageUrl) {
            document.getElementById('profileImage').src = user.imageUrl;
            document.querySelector('.dropdown-header img').src = user.imageUrl;
        }
    }
}

function handleLogout() {
    // Use the AuthManager logout function for consistency
    AuthManager.logout().then((loggedOut) => {
        if (loggedOut) {
            // Reset to default values
            document.getElementById('userName').textContent = 'Guest';
            document.getElementById('dropdownUserName').textContent = 'Guest';
            document.getElementById('dropdownUserEmail').textContent = 'guest@example.com';
            document.getElementById('profileImage').src = 'https://via.placeholder.com/40';
            document.querySelector('.dropdown-header img').src = 'https://via.placeholder.com/60';
            closeProfileDropdown();
        }
    });
}

// Category management
function populateCategories() {
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
}

function updateCategories(type) {
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    const typeCategories = categories[type] || [];
    
    typeCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Transaction handling
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    try {
        const transaction = {
            type: transactionType.value,
            amount: parseFloat(amountInput.value),
            category: categorySelect.value,
            date: dateInput.value,
            description: descriptionInput.value || ''
        };

        // Validation
        if (!transaction.type || !transaction.amount || !transaction.category || !transaction.date) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (transaction.amount <= 0) {
            showNotification('Amount must be greater than 0', 'error');
            return;
        }

        TransactionManager.addTransaction(transaction);
        updateDashboard();
        updateTransactionTable();
        
        // Reset form
        transactionForm.reset();
        if (dateInput) dateInput.valueAsDate = new Date();
        
        showNotification('Transaction added successfully!', 'success');
        
        // Redirect to dashboard if on add page
        if (window.location.pathname.includes('add.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showNotification('Error adding transaction', 'error');
    }
}

// Dashboard updates
function updateDashboard() {
    const transactions = TransactionManager.getTransactions();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = Analytics.getTotalIncome(transactions);
    const totalExpenses = Analytics.getTotalExpenses(transactions);
    const balance = totalIncome - totalExpenses;
    const monthlyNet = Analytics.getTotalIncome(monthlyTransactions) - Analytics.getTotalExpenses(monthlyTransactions);

    // Update overview boxes
    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(totalExpenses);
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);
    if (monthlyNetEl) monthlyNetEl.textContent = formatCurrency(monthlyNet);

    // Update recent transactions
    updateRecentTransactions(transactions);
}

function updateRecentTransactions(transactions) {
    if (!recentTransactionsEl) return;

    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentTransactionsEl.innerHTML = '';

    if (recentTransactions.length === 0) {
        recentTransactionsEl.innerHTML = '<li class="no-transactions">No transactions yet</li>';
        return;
    }

    recentTransactions.forEach(transaction => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-category">${transaction.category}</span>
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <span class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
            </span>
        `;
        recentTransactionsEl.appendChild(li);
    });
}

// Transaction table updates
function updateTransactionTable() {
    if (!transactionTableBody) return;
    
    let transactions = TransactionManager.getTransactions();
    
    // Apply filters
    if (filterType && filterType.value) {
        transactions = transactions.filter(t => t.type === filterType.value);
    }
    if (filterCategory && filterCategory.value) {
        transactions = transactions.filter(t => t.category === filterCategory.value);
    }
    if (startDateFilter && startDateFilter.value) {
        transactions = transactions.filter(t => t.date >= startDateFilter.value);
    }
    if (endDateFilter && endDateFilter.value) {
        transactions = transactions.filter(t => t.date <= endDateFilter.value);
    }
    
    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear table
    transactionTableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No transactions found</td>
            </tr>
        `;
        return;
    }
    
    // Add transactions to table
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td><span class="badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}">${capitalizeFirst(transaction.type)}</span></td>
            <td>${transaction.category}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transaction.id})" title="Delete transaction">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        transactionTableBody.appendChild(row);
    });
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            TransactionManager.deleteTransaction(id);
            updateDashboard();
            updateTransactionTable();
            showNotification('Transaction deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showNotification('Error deleting transaction', 'error');
        }
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions for global access
window.deleteTransaction = deleteTransaction;
