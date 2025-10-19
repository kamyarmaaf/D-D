import React, { useState } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import UnifiedAuth from './UnifiedAuth';

const Login: React.FC = () => {
  const { isAuthenticated } = useGoogleAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ink mb-4">
            D&D Bolt
          </h1>
          <p className="text-ink-muted text-lg">
            ماجراجویی‌های حماسی در انتظار شماست
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-ink mb-2">
              ورود به بازی
            </h2>
            <p className="text-ink-muted">
              برای شروع ماجراجویی، وارد شوید
            </p>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            شروع ماجراجویی
          </button>

          <div className="text-sm text-ink-muted">
            <p>با ورود به بازی، شما با قوانین و مقررات موافقت می‌کنید</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <UnifiedAuth onClose={() => setShowAuthModal(false)} showBackButton={true} />
      )}
    </div>
  );
};

export default Login;
