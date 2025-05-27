// Chart Colors
const chartColors = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529'
};

// Chart Configuration
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Financial Overview'
            }
        }
    }
};

// Initialize Charts
function initializeCharts() {
    // Category Pie Chart
    const categoryPieCtx = document.getElementById('categoryPieChart');
    if (categoryPieCtx) {
        new Chart(categoryPieCtx, {
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
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Spending Categories'
                    }
                }
            }
        });
    }

    // Income vs Expenses Bar Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseBarChart');
    if (incomeExpenseCtx) {
        new Chart(incomeExpenseCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        data: [],
                        backgroundColor: chartColors.success
                    },
                    {
                        label: 'Expenses',
                        data: [],
                        backgroundColor: chartColors.danger
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Income vs Expenses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Cash Flow Line Chart
    const cashFlowCtx = document.getElementById('cashFlowLineChart');
    if (cashFlowCtx) {
        new Chart(cashFlowCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cash Flow',
                    data: [],
                    borderColor: chartColors.primary,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Cash Flow Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Update Charts with Data
function updateCharts(transactions) {
    // Update Category Pie Chart
    const categoryPieChart = Chart.getChart('categoryPieChart');
    if (categoryPieChart) {
        const categoryData = Analytics.getCategoryTotals(
            transactions.filter(t => t.type === 'expense')
        );
        categoryPieChart.data.labels = Object.keys(categoryData);
        categoryPieChart.data.datasets[0].data = Object.values(categoryData);
        categoryPieChart.update();
    }

    // Update Income vs Expenses Bar Chart
    const incomeExpenseChart = Chart.getChart('incomeExpenseBarChart');
    if (incomeExpenseChart) {
        const monthlyData = Analytics.getMonthlyData(transactions);
        const months = Object.keys(monthlyData).sort();
        const incomeData = months.map(month => monthlyData[month].income);
        const expenseData = months.map(month => monthlyData[month].expenses);

        incomeExpenseChart.data.labels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
        });
        incomeExpenseChart.data.datasets[0].data = incomeData;
        incomeExpenseChart.data.datasets[1].data = expenseData;
        incomeExpenseChart.update();
    }

    // Update Cash Flow Line Chart
    const cashFlowChart = Chart.getChart('cashFlowLineChart');
    if (cashFlowChart) {
        const monthlyData = Analytics.getMonthlyData(transactions);
        const months = Object.keys(monthlyData).sort();
        const cashFlowData = months.map(month => 
            monthlyData[month].income - monthlyData[month].expenses
        );

        cashFlowChart.data.labels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
        });
        cashFlowChart.data.datasets[0].data = cashFlowData;
        cashFlowChart.update();
    }
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    const transactions = TransactionManager.getTransactions();
    updateCharts(transactions);
});
