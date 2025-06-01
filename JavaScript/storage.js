// Transaction Categories
const categories = {
    income: [
        'Salary',
        'Freelance',
        'Investments',
        'Gifts',
        'Other Income'
    ],
    expense: [
        'Food & Dining',
        'Housing',
        'Transportation',
        'Utilities',
        'Entertainment',
        'Shopping',
        'Healthcare',
        'Education',
        'Travel',
        'Other Expenses'
    ]
};

// Initialize storage if not exists
function initializeStorage() {
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(null));
    }
}

// Transaction Management
const TransactionManager = {
    addTransaction: function(transaction) {
        try {
            const transactions = this.getTransactions();
            transaction.id = Date.now();
            transaction.timestamp = new Date().toISOString();
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            // Update UI elements
            this.updateBalance();
            this.updateRecentTransactions();
            
            // Update charts if they exist
            if (typeof updateCharts === 'function') {
                updateCharts(transactions);
            }
            
            // Show success notification
            showNotification('Transaction saved successfully!', 'success');
            
            // Send email notification if enabled
            this.sendNotificationEmail(transaction);
            
            return true;
        } catch (error) {
            console.error('Error adding transaction:', error);
            showNotification('Error saving transaction', 'error');
            return false;
        }
    },

    getTransactions: function() {
        try {
            const transactions = localStorage.getItem('transactions');
            return transactions ? JSON.parse(transactions) : [];
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    updateBalance: function() {
        try {
            const transactions = this.getTransactions();
            const balance = transactions.reduce((acc, transaction) => {
                return transaction.type === 'income' 
                    ? acc + parseFloat(transaction.amount)
                    : acc - parseFloat(transaction.amount);
            }, 0);

            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.textContent = this.formatCurrency(balance);
                balanceElement.classList.remove('text-success', 'text-danger');
                balanceElement.classList.add(balance >= 0 ? 'text-success' : 'text-danger');
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    },

    updateRecentTransactions: function() {
        try {
            const recentTransactionsElement = document.getElementById('recentTransactions');
            if (!recentTransactionsElement) return;

            const transactions = this.getTransactions()
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 5);

            if (transactions.length === 0) {
                recentTransactionsElement.innerHTML = '<p class="text-muted">No recent transactions</p>';
                return;
            }

            recentTransactionsElement.innerHTML = transactions.map(transaction => `
                <div class="transaction-item mb-3 p-3 bg-light rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${transaction.description || transaction.category}</strong>
                            <div class="text-muted small">
                                ${transaction.category} • ${formatDate(transaction.date)}
                            </div>
                        </div>
                        <div class="text-${transaction.type === 'income' ? 'success' : 'danger'} fw-bold">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </div>
                    </div>
                </div>
            `).join('');

            // Dispatch event to notify other components
            window.dispatchEvent(new Event('transactionsUpdated'));
        } catch (error) {
            console.error('Error updating recent transactions:', error);
        }
    },

    formatCurrency: function(amount) {
        try {
            const settings = JSON.parse(localStorage.getItem('settings')) || {};
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: settings.currency || 'USD'
            }).format(amount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return `$${amount.toFixed(2)}`;
        }
    },

    sendNotificationEmail: function(transaction) {
        try {
            const settings = JSON.parse(localStorage.getItem('settings')) || {};
            if (!settings.notifications?.email || !settings.emailNotifications) return;

            const emailData = {
                to: settings.emailNotifications,
                subject: `New ${transaction.type} Transaction`,
                body: `
                    A new ${transaction.type} of ${this.formatCurrency(transaction.amount)} has been added.
                    Description: ${transaction.description}
                    Category: ${transaction.category}
                    Date: ${new Date(transaction.timestamp).toLocaleString()}
                `
            };

            // Send email using your preferred method
            // For demo purposes, we'll just log it
            console.log('Email notification:', emailData);
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    },

    resetData: function() {
        try {
            // Clear all transaction data
            localStorage.removeItem('transactions');
            
            // Reset settings to defaults
            const defaultSettings = {
                currency: 'USD',
                theme: 'light',
                fontSize: 'medium',
                language: 'en',
                dateFormat: 'MM/DD/YYYY',
                notifications: {
                    email: false,
                    browser: false
                }
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
            
            // Update UI
            this.updateBalance();
            this.updateRecentTransactions();
            
            // Update charts if they exist
            if (typeof updateCharts === 'function') {
                updateCharts([]);
            }
            
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            return false;
        }
    },

    deleteTransaction: function(id) {
        try {
            let transactions = this.getTransactions();
            transactions = transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            // Update charts
            if (typeof updateCharts === 'function') {
                updateCharts(transactions);
            }
            
            if (typeof showNotification === 'function') {
                showNotification('Transaction deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error deleting transaction', 'error');
            }
        }
    },

    updateTransaction: function(id, updatedTransaction) {
        let transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updatedTransaction };
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return true;
        }
        return false;
    },

    getTransactionsByDateRange: function(startDate, endDate) {
        const transactions = this.getTransactions();
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    },

    getTransactionsByType: function(type) {
        const transactions = this.getTransactions();
        return transactions.filter(t => t.type === type);
    },

    getTransactionsByCategory: function(category) {
        const transactions = this.getTransactions();
        return transactions.filter(t => t.category === category);
    }
};

// User Management
const UserManager = {
    setUser: function(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    },

    getUser: function() {
        return JSON.parse(localStorage.getItem('user'));
    },

    isLoggedIn: function() {
        return this.getUser() !== null;
    },

    logout: function() {
        localStorage.setItem('user', JSON.stringify(null));
    }
};

// Analytics Functions with improved calculations
const Analytics = {
    getTotalIncome: function(transactions) {
        return transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },

    getTotalExpenses: function(transactions) {
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },

    getBalance: function(transactions) {
        return this.getTotalIncome(transactions) - this.getTotalExpenses(transactions);
    },

    getCategoryTotals: function(transactions) {
        try {
            const expensesByCategory = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                    acc[t.category] = acc[t.category] || { amount: 0, count: 0 };
                    acc[t.category].amount += parseFloat(t.amount);
                    acc[t.category].count += 1;
                    return acc;
                }, {});

            const totalExpenses = Object.values(expensesByCategory)
                .reduce((sum, cat) => sum + cat.amount, 0);

            // Calculate percentages
            return Object.entries(expensesByCategory).reduce((acc, [category, data]) => {
                acc[category] = {
                    ...data,
                    percentage: totalExpenses > 0 
                        ? ((data.amount / totalExpenses) * 100).toFixed(1)
                        : 0
                };
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating category totals:', error);
            return {};
        }
    },

    getMonthlyData: function(transactions) {
        try {
            return transactions.reduce((acc, t) => {
                const date = new Date(t.timestamp);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!acc[monthKey]) {
                    acc[monthKey] = {
                        income: 0,
                        expenses: 0,
                        cashFlow: 0
                    };
                }
                
                const amount = parseFloat(t.amount);
                if (t.type === 'income') {
                    acc[monthKey].income += amount;
                    acc[monthKey].cashFlow += amount;
                } else {
                    acc[monthKey].expenses += amount;
                    acc[monthKey].cashFlow -= amount;
                }
                
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating monthly data:', error);
            return {};
        }
    }
};

// Initialize storage when the script loads
initializeStorage();

// Export for global use
window.TransactionManager = TransactionManager;
window.Analytics = Analytics;

// Initialize data if needed
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    
    // Update UI elements
    TransactionManager.updateBalance();
    TransactionManager.updateRecentTransactions();
});
