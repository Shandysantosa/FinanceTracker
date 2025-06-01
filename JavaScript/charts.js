// Chart Colors with transparency
const chartColors = {
    primary: 'rgba(13, 110, 253, 0.8)',
    success: 'rgba(25, 135, 84, 0.8)',
    danger: 'rgba(220, 53, 69, 0.8)',
    warning: 'rgba(255, 193, 7, 0.8)',
    info: 'rgba(13, 202, 240, 0.8)',
    secondary: 'rgba(108, 117, 125, 0.8)',
    light: 'rgba(248, 249, 250, 0.8)',
    dark: 'rgba(33, 37, 41, 0.8)'
};

let categoryPieChart, monthlyTrendChart, incomeExpenseChart;

function initializeCharts() {
    const transactions = TransactionManager.getTransactions();
    
    // Initialize Income vs Expenses Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
    if (incomeExpenseCtx) {
        incomeExpenseChart = new Chart(incomeExpenseCtx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [chartColors.success, chartColors.danger],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize Category Pie Chart
    const categoryPieCtx = document.getElementById('categoryPieChart');
    if (categoryPieCtx) {
        categoryPieChart = new Chart(categoryPieCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: Object.values(chartColors)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize Monthly Trend Chart
    const trendChartCtx = document.getElementById('monthlyTrendChart');
    if (trendChartCtx) {
        monthlyTrendChart = new Chart(trendChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        data: [],
                        borderColor: chartColors.success,
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: [],
                        borderColor: chartColors.danger,
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    // Initial update
    updateCharts(transactions);
}

function updateCharts(transactions) {
    try {
        // Update Income vs Expenses Chart
        if (incomeExpenseChart) {
            const totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            const totalExpenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            incomeExpenseChart.data.datasets[0].data = [totalIncome, totalExpenses];
            incomeExpenseChart.update();
        }

        // Update Category Pie Chart
        if (categoryPieChart) {
            const expensesByCategory = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
                    return acc;
                }, {});

            categoryPieChart.data.labels = Object.keys(expensesByCategory);
            categoryPieChart.data.datasets[0].data = Object.values(expensesByCategory);
            categoryPieChart.update();
        }

        // Update Monthly Trend Chart
        if (monthlyTrendChart) {
            const monthlyData = {};
            
            // Get last 6 months
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[monthKey] = { income: 0, expenses: 0 };
            }
            
            // Process transactions
            transactions.forEach(t => {
                const date = new Date(t.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (monthlyData[monthKey]) {
                    if (t.type === 'income') {
                        monthlyData[monthKey].income += parseFloat(t.amount);
                    } else {
                        monthlyData[monthKey].expenses += parseFloat(t.amount);
                    }
                }
            });

            // Sort months
            const sortedMonths = Object.keys(monthlyData).sort();

            // Update chart data
            monthlyTrendChart.data.labels = sortedMonths.map(month => {
                const [year, monthNum] = month.split('-');
                return new Date(year, monthNum - 1).toLocaleDateString('default', { 
                    month: 'short',
                    year: 'numeric'
                });
            });

            monthlyTrendChart.data.datasets[0].data = sortedMonths.map(month => monthlyData[month].income);
            monthlyTrendChart.data.datasets[1].data = sortedMonths.map(month => monthlyData[month].expenses);
            monthlyTrendChart.update();
        }
    } catch (error) {
        console.error('Error updating charts:', error);
        showNotification('Error updating charts', 'error');
    }
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', initializeCharts);

// Export for global use
window.initializeCharts = initializeCharts;
window.updateCharts = updateCharts;
