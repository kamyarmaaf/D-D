import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GOOGLE_CONFIG } from '../config/google';

interface GoogleUser {
  credential: string;
  select_by: string;
}

interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google: any;
    googleCallback: (response: GoogleAuthResponse) => void;
  }
}

export const useGoogleAuth = () => {
  const { login, logout, isAuthenticated, user } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
      initializeGoogleAuth();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const initializeGoogleAuth = () => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false // Disable FedCM to avoid NetworkError
        });
        console.log('Google OAuth initialized successfully');
      } catch (error) {
        console.error('Error initializing Google OAuth:', error);
      }
    }
  };

  const handleGoogleResponse = (response: GoogleAuthResponse) => {
    try {
      // Decode JWT token (simplified - in production, verify on server)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const userData = JSON.parse(jsonPayload);
      
      const user: any = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        googleId: userData.sub
      };
      
      login(user);
    } catch (error) {
      console.error('Error processing Google response:', error);
    }
  };

  const signIn = () => {
    if (window.google && isGoogleLoaded) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to manual sign-in
            window.google.accounts.oauth2.initCodeClient({
              client_id: GOOGLE_CONFIG.CLIENT_ID,
              scope: 'openid profile email',
              callback: handleGoogleResponse
            }).requestCode();
          }
        });
      } catch (error) {
        console.error('Error during Google sign-in:', error);
        // Fallback method
        window.google.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          scope: 'openid profile email',
          callback: handleGoogleResponse
        }).requestCode();
      }
    }
  };

  const signOut = () => {
    logout();
    if (window.google && isGoogleLoaded) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return {
    signIn,
    signOut,
    isGoogleLoaded,
    isAuthenticated,
    user
  };
};
