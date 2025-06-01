// Authentication utilities and route protection
const AuthManager = {
    // Check if current page requires authentication
    requiresAuth: function() {
        const publicPages = ['login.html', 'register.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return !publicPages.includes(currentPage);
    },

    // Redirect to login if not authenticated
    checkAuth: function() {
        if (this.requiresAuth() && !UserManager.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Initialize authentication check
    init: function() {
        // Check authentication on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuth();
        });
    },

    // Handle logout from any page
    logout: function() {
        return new Promise((resolve) => {
            if (confirm('Are you sure you want to logout?')) {
                UserManager.logout();
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification('Logged out successfully', 'success');
                }
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                    resolve(true);
                }, 1000);
            } else {
                resolve(false);
            }
        });
    },

    // Get current user with fallback
    getCurrentUser: function() {
        const user = UserManager.getUser();
        if (!user && this.requiresAuth()) {
            this.checkAuth();
            return null;
        }
        return user;
    }
};

// Google Sign-In Configuration
const GoogleAuth = {
    clientId: '951177710655-hktcr9qj45odpnepihu1uhlni7uvs1qj.apps.googleusercontent.com', // Replace with your actual Client ID
    
    // Initialize Google Sign-In
    init: function() {
        // This will be called when the Google script loads
        window.addEventListener('load', () => {
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: this.clientId,
                    callback: this.handleCredentialResponse
                });
            }
        });
    },

    // Handle the credential response from Google
    handleCredentialResponse: function(response) {
        console.log('Google Sign-In Response:', response);
        // The actual handling is done in the login.html file
        // This is here for reference and potential future use
    },

    // Programmatic sign out (if needed)
    signOut: function() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
    }
};

// Enhanced UserManager functions
const UserSessionManager = {
    // Set session timeout (optional)
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

    // Check if session is expired
    isSessionExpired: function() {
        const user = UserManager.getUser();
        if (!user || !user.loginTime) return true;

        const loginTime = new Date(user.loginTime);
        const currentTime = new Date();
        const timeDiff = currentTime - loginTime;

        return timeDiff > this.sessionTimeout;
    },

    // Refresh session
    refreshSession: function() {
        const user = UserManager.getUser();
        if (user) {
            user.loginTime = new Date().toISOString();
            UserManager.setUser(user);
        }
    },

    // Auto-logout on session expiry
    checkSessionExpiry: function() {
        if (UserManager.isLoggedIn() && this.isSessionExpired()) {
            alert('Your session has expired. Please log in again.');
            AuthManager.logout();
        }
    }
};

// Route protection for sensitive pages
const RouteProtection = {
    // Protect specific routes
    protectedRoutes: ['add.html', 'history.html', 'insights.html', 'tips.html'],

    // Check if current route is protected
    isProtectedRoute: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return this.protectedRoutes.includes(currentPage);
    },

    // Enhanced auth check with specific route protection
    checkRouteAccess: function() {
        if (this.isProtectedRoute() && !UserManager.isLoggedIn()) {
            // Store the intended destination
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// User Management
const UserManager = {
    setUser: function(userData) {
        try {
            // Set default profile picture if none provided
            if (!userData.imageUrl) {
                userData.imageUrl = 'contents/default_pp.jpg';
            }
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Initialize default data for new users
            if (!localStorage.getItem('transactions')) {
                localStorage.setItem('transactions', JSON.stringify([]));
            }
            
            // Initialize default settings
            if (!localStorage.getItem('settings')) {
                const defaultSettings = {
                    theme: 'light',
                    currency: 'USD',
                    fontSize: 'medium',
                    language: 'en',
                    notifications: {
                        email: true,
                        browser: true
                    },
                    emailNotifications: userData.email
                };
                localStorage.setItem('settings', JSON.stringify(defaultSettings));
            }
            
            this.updateProfileDisplay(userData);
        } catch (error) {
            console.error('Error setting user data:', error);
            throw new Error('Failed to save user data');
        }
    },

    getUser: function() {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    updateProfileDisplay: function(userData) {
        try {
            const profileImages = document.querySelectorAll('#profileImage, .dropdown-header img');
            profileImages.forEach(img => {
                img.src = userData.imageUrl || 'contents/default_pp.jpg';
                img.onerror = function() {
                    this.src = 'contents/default_pp.jpg';
                };
            });

            const userNames = document.querySelectorAll('#userName, #dropdownUserName');
            userNames.forEach(el => {
                el.textContent = userData.name || 'Guest';
            });

            const userEmail = document.getElementById('dropdownUserEmail');
            if (userEmail) {
                userEmail.textContent = userData.email || 'guest@example.com';
            }
        } catch (error) {
            console.error('Error updating profile display:', error);
        }
    },

    isLoggedIn: function() {
        try {
            const user = this.getUser();
            if (!user) return false;

            // Check if login time is within the session timeout
            const loginTime = new Date(user.loginTime);
            const currentTime = new Date();
            const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
            return currentTime - loginTime < sessionTimeout;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    },

    logout: function() {
        try {
            // Clear all user data
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear any active sessions or tokens
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }
            
            showNotification('Successfully logged out', 'success');
        } catch (error) {
            console.error('Error during logout:', error);
            showNotification('Error during logout', 'error');
        }
    },

    refreshSession: function() {
        try {
            const user = this.getUser();
            if (user) {
                user.loginTime = new Date().toISOString();
                this.setUser(user);
            }
        } catch (error) {
            console.error('Error refreshing session:', error);
        }
    }
};

// Initialize authentication system with error handling
try {
    AuthManager.init();
} catch (error) {
    console.error('Error initializing auth system:', error);
}

// Check session expiry every 5 minutes
setInterval(() => {
    try {
        UserSessionManager.checkSessionExpiry();
    } catch (error) {
        console.error('Error checking session expiry:', error);
    }
}, 5 * 60 * 1000);

// Activity tracker to refresh session on user activity
let activityTimer;
function resetActivityTimer() {
    try {
        clearTimeout(activityTimer);
        activityTimer = setTimeout(() => {
            if (UserManager.isLoggedIn()) {
                UserManager.refreshSession();
            }
        }, 30 * 60 * 1000); // 30 minutes of inactivity
    } catch (error) {
        console.error('Error resetting activity timer:', error);
    }
}

// Track user activity with error handling
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    try {
        document.addEventListener(event, resetActivityTimer, true);
    } catch (error) {
        console.error(`Error adding ${event} listener:`, error);
    }
});

// Export for global use
window.AuthManager = AuthManager;
window.GoogleAuth = GoogleAuth;
window.UserSessionManager = UserSessionManager;
window.RouteProtection = RouteProtection;
window.UserManager = UserManager; 