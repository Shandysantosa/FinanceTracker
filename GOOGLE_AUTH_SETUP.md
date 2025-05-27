# Google Authentication Setup Guide

This guide will help you implement Google Sign-In for your Finance Tracker application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. A web server to host your application (local or production)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "Finance Tracker")
4. Click "Create"

## Step 2: Enable Google Sign-In API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google Sign-In API" or "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in the required fields:
     - App name: "Finance Tracker"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

4. For the OAuth client ID:
   - Application type: "Web application"
   - Name: "Finance Tracker Web Client"
   - Authorized JavaScript origins:
     - For local development: `http://localhost:3000` (or your local port)
     - For production: `https://yourdomain.com`
   - Authorized redirect URIs:
     - For local development: `http://localhost:3000/login.html`
     - For production: `https://yourdomain.com/login.html`

5. Click "Create"
6. Copy the Client ID (you'll need this for the next step)

## Step 4: Update Your Application

1. Open `login.html` and `register.html`
2. Find this line:
   ```html
   data-client_id="YOUR_GOOGLE_CLIENT_ID"
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID from Step 3

4. Also update in `JavaScript/auth.js`:
   ```javascript
   clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Client ID
   ```

## Step 5: Test the Implementation

1. Serve your application from a web server (not just opening the HTML file directly)
2. For local testing, you can use:
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js (install http-server globally)
   npx http-server -p 3000
   
   # Using PHP
   php -S localhost:3000
   ```

3. Open your browser and navigate to `http://localhost:3000/login.html`
4. You should see the Google Sign-In button
5. Click it to test the authentication flow

## Security Best Practices

1. **Never expose your Client Secret**: The Client ID is public, but never include the Client Secret in frontend code
2. **Use HTTPS in production**: Google requires HTTPS for production applications
3. **Validate tokens on the backend**: In a production app, always verify the JWT token on your server
4. **Limit authorized domains**: Only add domains you control to the authorized origins

## Troubleshooting

### Common Issues:

1. **"Invalid origin" error**:
   - Make sure your domain is added to "Authorized JavaScript origins"
   - Ensure you're accessing via the exact URL you specified

2. **"Redirect URI mismatch"**:
   - Check that your redirect URIs match exactly (including http/https)

3. **Google Sign-In button not appearing**:
   - Check browser console for errors
   - Verify your Client ID is correct
   - Ensure you're serving from a web server, not opening files directly

4. **"Access blocked" error**:
   - Make sure your OAuth consent screen is properly configured
   - Add your email as a test user if the app is in testing mode

## Additional Features

### Backend Verification (Recommended for Production)

For a production application, you should verify the JWT token on your backend:

```php
<?php
// Example PHP verification
function verifyGoogleToken($idToken, $clientId) {
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . $idToken;
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    if ($data['aud'] === $clientId && $data['exp'] > time()) {
        return $data; // Valid token
    }
    return false; // Invalid token
}
?>
```

### Automatic Sign-Out

To implement automatic sign-out when the user logs out:

```javascript
// Add this to your logout function
if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
}
```

## Demo Account

For testing purposes, the application includes a demo account:
- Email: `demo@financetracker.com`
- Password: `demo123`

This allows testing without setting up Google authentication immediately.

## Production Deployment

When deploying to production:

1. Update the authorized origins and redirect URIs in Google Cloud Console
2. Use HTTPS for all URLs
3. Consider implementing server-side token verification
4. Set up proper error handling and user feedback
5. Consider adding refresh token functionality for extended sessions

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all URLs and credentials are correct
3. Ensure your OAuth consent screen is properly configured
4. Test with the demo account first to isolate Google Auth issues 