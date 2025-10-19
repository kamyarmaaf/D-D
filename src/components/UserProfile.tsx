import React from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user: googleUser, signOut: googleSignOut, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const { user: authUser, logout: authLogout, isAuthenticated: isAuthAuthenticated } = useAuth();

  // Use either Google user or Auth user
  const user = googleUser || authUser;
  const isAuthenticated = isGoogleAuthenticated || isAuthAuthenticated;
  const signOut = googleSignOut || authLogout;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 space-x-reverse">
      {/* User Avatar */}
      <div className="relative">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-amber-400/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink truncate">
            {user.name}
          </p>
          {user.authProvider === 'google' ? (
            <span title="ورود با گوگل" className="inline-flex">
              <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
                <circle cx="12" cy="12" r="11" fill="#fff" />
                <circle cx="12" cy="12" r="9" fill="none" stroke="#EA4335" strokeWidth="4" strokeDasharray="20 38" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" fill="none" stroke="#FBBC05" strokeWidth="4" strokeDasharray="20 38" strokeLinecap="round" transform="rotate(120 12 12)" />
                <circle cx="12" cy="12" r="9" fill="none" stroke="#34A853" strokeWidth="4" strokeDasharray="20 38" strokeLinecap="round" transform="rotate(240 12 12)" />
                <circle cx="12" cy="12" r="4" fill="#4285F4" />
              </svg>
            </span>
          ) : user.authProvider === 'email' ? (
            <Mail className="w-3 h-3 text-green-400" title="ورود با ایمیل" />
          ) : null}
        </div>
        <p className="text-xs text-ink-muted truncate">
          {user.email}
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={signOut}
        className="p-2 text-ink-muted hover:text-ink hover:bg-white/10 rounded-lg transition-all duration-300 group"
        title="خروج از حساب"
      >
        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default UserProfile;
