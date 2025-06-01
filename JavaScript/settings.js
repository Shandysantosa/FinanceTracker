// Currency settings
const currencies = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    CHF: { symbol: 'Fr', name: 'Swiss Franc' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' }
};

// Settings Management
const SettingsManager = {
    // Default settings
    defaults: {
        currency: 'USD',
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        startOfWeek: 'sunday',
        language: 'en',
        notifications: {
            email: false,
            push: false,
            budget: false
        },
        privacy: {
            shareUsageData: false,
            shareTrendData: false
        }
    },

    // Get settings
    getSettings: function() {
        return {
            ...{
                currency: 'USD',
                theme: 'light',
                dateFormat: 'MM/DD/YYYY',
                notifications: true
            },
            ...JSON.parse(localStorage.getItem('userSettings') || '{}')
        };
    },

    // Save settings
    saveSettings: function(settings) {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        this.applySettings(settings);
        showNotification('Settings saved successfully!', 'success');
    },

    // Apply settings to the UI
    applySettings: function(settings) {
        // Apply theme
        document.body.setAttribute('data-theme', settings.theme);
        
        // Apply currency to all amount displays
        this.updateCurrencyDisplays(settings.currency);
    },

    updateCurrencyDisplays: function(currencyCode) {
        const currency = currencies[currencyCode];
        if (!currency) return;

        // Update all amount displays
        document.querySelectorAll('[data-amount]').forEach(el => {
            const amount = parseFloat(el.dataset.amount);
            el.textContent = this.formatCurrency(amount, currencyCode);
        });
    },

    formatCurrency: function(amount, currencyCode = 'USD') {
        const currency = currencies[currencyCode];
        if (!currency) return `${currencies.USD.symbol}${amount.toFixed(2)}`;

        if (currencyCode === 'IDR') {
            return `${currency.symbol} ${amount.toLocaleString('id-ID')}`;
        }

        return `${currency.symbol}${amount.toFixed(2)}`;
    }
};

// Handle currency form submission
document.getElementById('currencyForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const settings = SettingsManager.getSettings();
    settings.currency = document.getElementById('currency').value;
    SettingsManager.saveSettings(settings);
    showNotification('Currency settings updated successfully!', 'success');
});

// Handle general settings form submission
document.getElementById('generalSettingsForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const settings = SettingsManager.getSettings();

    settings.theme = document.querySelector('input[name="theme"]:checked').value;
    settings.dateFormat = document.getElementById('dateFormat').value;
    settings.startOfWeek = document.getElementById('startOfWeek').value;
    settings.language = document.getElementById('language').value;
    settings.notifications = {
        email: document.getElementById('emailNotifications').checked,
        push: document.getElementById('pushNotifications').checked,
        budget: document.getElementById('budgetAlerts').checked
    };

    SettingsManager.saveSettings(settings);
    showNotification('General settings updated successfully!', 'success');
});

// Handle privacy settings form submission
document.getElementById('privacySettingsForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const settings = SettingsManager.getSettings();

    settings.privacy = {
        shareUsageData: document.getElementById('shareUsageData').checked,
        shareTrendData: document.getElementById('shareTrendData').checked
    };

    SettingsManager.saveSettings(settings);
    showNotification('Privacy settings updated successfully!', 'success');
});

// Load existing settings
document.addEventListener('DOMContentLoaded', function() {
    const settings = SettingsManager.getSettings();
    
    // Set currency
    if (document.getElementById('currency')) {
        document.getElementById('currency').value = settings.currency;
    }

    // Set theme
    if (document.querySelector(`input[name="theme"][value="${settings.theme}"]`)) {
        document.querySelector(`input[name="theme"][value="${settings.theme}"]`).checked = true;
    }

    // Set date format
    if (document.getElementById('dateFormat')) {
        document.getElementById('dateFormat').value = settings.dateFormat;
    }

    // Set start of week
    if (document.getElementById('startOfWeek')) {
        document.getElementById('startOfWeek').value = settings.startOfWeek;
    }

    // Set language
    if (document.getElementById('language')) {
        document.getElementById('language').value = settings.language;
    }

    // Set notifications
    if (settings.notifications) {
        if (document.getElementById('emailNotifications')) {
            document.getElementById('emailNotifications').checked = settings.notifications.email;
        }
        if (document.getElementById('pushNotifications')) {
            document.getElementById('pushNotifications').checked = settings.notifications.push;
        }
        if (document.getElementById('budgetAlerts')) {
            document.getElementById('budgetAlerts').checked = settings.notifications.budget;
        }
    }

    // Set privacy settings
    if (settings.privacy) {
        if (document.getElementById('shareUsageData')) {
            document.getElementById('shareUsageData').checked = settings.privacy.shareUsageData;
        }
        if (document.getElementById('shareTrendData')) {
            document.getElementById('shareTrendData').checked = settings.privacy.shareTrendData;
        }
    }

    // Apply current settings
    SettingsManager.applySettings(settings);
});

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    const settings = SettingsManager.getSettings();
    SettingsManager.applySettings(settings);
});

// Export for global use
window.SettingsManager = SettingsManager;
window.currencies = currencies; 