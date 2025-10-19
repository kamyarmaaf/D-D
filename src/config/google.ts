// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Replace with your actual Google Client ID
  // Get it from: https://console.developers.google.com/
  CLIENT_ID: '46822171141-930p02f73jas0ghb7uglrru6al54g70o.apps.googleusercontent.com',
  
  // Scopes for the OAuth request
  SCOPES: [
    'openid',
    'profile',
    'email'
  ],
  
  // Redirect URI (for web apps, this is usually the current domain)
  REDIRECT_URI: window.location.origin
};

// Instructions for setting up Google OAuth:
// 1. Go to https://console.developers.google.com/
// 2. Create a new project or select existing one
// 3. Enable Google+ API
// 4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
// 5. Set Application type to "Web application"
// 6. Add your domain to "Authorized JavaScript origins"
// 7. Copy the Client ID and replace 'YOUR_GOOGLE_CLIENT_ID' above
