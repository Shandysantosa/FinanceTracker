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
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Client ID
    
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

// Initialize authentication system
AuthManager.init();

// Check session expiry every 5 minutes
setInterval(() => {
    UserSessionManager.checkSessionExpiry();
}, 5 * 60 * 1000);

// Activity tracker to refresh session on user activity
let activityTimer;
function resetActivityTimer() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        if (UserManager.isLoggedIn()) {
            UserSessionManager.refreshSession();
        }
    }, 30 * 60 * 1000); // 30 minutes of inactivity
}

// Track user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, true);
});

// Export for global use
window.AuthManager = AuthManager;
window.GoogleAuth = GoogleAuth;
window.UserSessionManager = UserSessionManager;
window.RouteProtection = RouteProtection; 