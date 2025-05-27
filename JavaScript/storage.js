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
        const transactions = this.getTransactions();
        transaction.id = Date.now(); // Unique ID
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        return transaction;
    },

    getTransactions: function() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
    },

    deleteTransaction: function(id) {
        let transactions = this.getTransactions();
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
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

// Analytics Functions
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
        const categoryTotals = {};
        transactions.forEach(t => {
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = 0;
            }
            categoryTotals[t.category] += parseFloat(t.amount);
        });
        return categoryTotals;
    },

    getMonthlyData: function(transactions) {
        const monthlyData = {};
        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    income: 0,
                    expenses: 0
                };
            }
            if (t.type === 'income') {
                monthlyData[monthYear].income += parseFloat(t.amount);
            } else {
                monthlyData[monthYear].expenses += parseFloat(t.amount);
            }
        });
        return monthlyData;
    }
};

// Initialize storage when the script loads
initializeStorage();
