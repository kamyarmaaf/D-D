import React, { useState } from 'react';
import { Mail, Users, Loader2, X } from 'lucide-react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useAuth } from '../contexts/AuthContext';

interface UnifiedAuthProps {
  onClose?: () => void;
  showBackButton?: boolean;
}

const UnifiedAuth: React.FC<UnifiedAuthProps> = ({ onClose, showBackButton = false }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn: signInWithGoogle, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const { registerWithEmail, loginWithEmail, isAuthenticated: isAuthAuthenticated } = useAuth();

  // Check if user is authenticated via either method
  const isAuthenticated = isGoogleAuthenticated || isAuthAuthenticated;

  // Close modal if user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && onClose) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('لطفاً تمام فیلدهای ضروری را پر کنید');
      return false;
    }

    if (mode === 'register') {
      if (!formData.username) {
        setError('نام کاربری الزامی است');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('رمزهای عبور مطابقت ندارند');
        return false;
      }
      if (formData.password.length < 6) {
        setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
        return false;
      }
    }

    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        await registerWithEmail(formData.email, formData.password, formData.username);
        setSuccess('حساب کاربری با موفقیت ایجاد شد!');
        // Reset form
        setFormData({
          email: '',
          username: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        await loginWithEmail(formData.email, formData.password);
        setSuccess('ورود موفقیت‌آمیز بود!');
      }
    } catch (error: any) {
      setError(error.message || 'خطایی رخ داد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError('خطا در ورود با گوگل');
    }
  };

  const GoogleTriColorIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#EA4335" strokeWidth="4" strokeDasharray="20 38" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#FBBC05" strokeWidth="4" strokeDasharray="20 38" strokeLinecap="round" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#34A853" strokeWidth="4" strokeDasharray="20 38" strokeLinecap="round" transform="rotate(240 12 12)" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-50/95 to-slate-100/95 backdrop-blur-xl border border-amber-300/30 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-amber-300/20">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-amber-600 hover:text-amber-800 transition-colors"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {mode === 'register' ? 'ثبت‌نام' : 'ورود'}
              </h2>
              <p className="text-sm text-slate-600">به دنیای ماجراجویی</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                ایمیل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pr-10 pl-4 py-3 bg-white/80 backdrop-blur-sm border border-amber-300/30 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all duration-300 shadow-sm"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Username Field - Only for registration */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                  نام کاربری
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-amber-300/30 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all duration-300 shadow-sm"
                  placeholder="نام کاربری خود را وارد کنید"
                />
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-10 pl-12 py-3 bg-white/80 backdrop-blur-sm border border-amber-300/30 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all duration-300 shadow-sm"
                  placeholder="رمز عبور خود را وارد کنید"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  {showPassword ? (
                    <span className="text-slate-400 hover:text-slate-600 transition-colors">👁️‍🗨️</span>
                  ) : (
                    <span className="text-slate-400 hover:text-slate-600 transition-colors">👁️</span>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field - Only for registration */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  تأیید رمز عبور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pr-10 pl-12 py-3 bg-white/80 backdrop-blur-sm border border-amber-300/30 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all duration-300 shadow-sm"
                    placeholder="رمز عبور را مجدداً وارد کنید"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <span className="text-slate-400 hover:text-slate-600 transition-colors">👁️‍🗨️</span>
                    ) : (
                      <span className="text-slate-400 hover:text-slate-600 transition-colors">👁️</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 text-sm text-center">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 space-x-reverse"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>در حال پردازش...</span>
                </>
              ) : (
                <span>{mode === 'register' ? 'ثبت‌نام' : 'ورود'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-300/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50/95 text-slate-500">یا</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 space-x-reverse"
          >
            <GoogleTriColorIcon className="h-5 w-5" />
            <span>ورود با گوگل</span>
          </button>

          {/* Switch Mode */}
          <div className="text-center">
            <p className="text-slate-600 text-sm">
              {mode === 'register' ? 'قبلاً حساب دارید؟' : 'حساب ندارید؟'}
              <button
                type="button"
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                className="text-amber-600 hover:text-amber-800 font-medium mr-2 transition-colors"
              >
                {mode === 'register' ? 'ورود' : 'ثبت‌نام'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-amber-300/20 bg-amber-50/30">
          <p className="text-xs text-slate-600 text-center">
            با ورود به بازی، شما با{' '}
            <a href="#" className="text-amber-600 hover:text-amber-800 transition-colors">
              شرایط استفاده
            </a>{' '}
            و{' '}
            <a href="#" className="text-amber-600 hover:text-amber-800 transition-colors">
              حریم خصوصی
            </a>{' '}
            موافقت می‌کنید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuth;
