import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sword, Users, Trophy, Sparkles, User, Package, Award, LogIn, Languages, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import UserProfile from './UserProfile';
import UnifiedAuth from './UnifiedAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { theme, setTheme, actualTheme } = useTheme();
  const { isAuthenticated: isAuthAuthenticated } = useAuth();
  const { isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user is authenticated via either method
  const isAuthenticated = isAuthAuthenticated || isGoogleAuthenticated;

  // Get current page from location
  const currentPage = location.pathname === '/' ? 'lobby' : 
                     location.pathname.startsWith('/game') ? 'game' :
                     location.pathname.startsWith('/scoreboard') ? 'scoreboard' :
                     location.pathname.startsWith('/character') ? 'character' :
                     location.pathname.startsWith('/inventory') ? 'inventory' :
                     location.pathname.startsWith('/achievements') ? 'achievements' : 'lobby';

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'lobby':
        navigate('/');
        break;
      case 'game':
        navigate('/game');
        break;
      case 'scoreboard':
        navigate('/scoreboard');
        break;
      case 'character':
        navigate('/character');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'achievements':
        navigate('/achievements');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className={`min-h-screen ${language === 'fa' ? 'rtl' : 'ltr'} overflow-x-hidden relative`}>
      {/* Mystical background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-400/5 to-rose-400/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/8 to-yellow-400/8 rounded-full blur-2xl floating-animation" style={{ animationDelay: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-2xl floating-animation" style={{ animationDelay: '8s' }}></div>
      </div>

      <header className="relative glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 lg:mt-6 ancient-scroll">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative">
                <Sword className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-amber-600 group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg" />
                <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 text-amber-500 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 animate-pulse drop-shadow-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold gradient-text truncate">{t('app.title')}</h1>
                <p className="text-xs text-ink-muted hidden sm:block drop-shadow-lg truncate">{t('app.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto">
              <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-1 sm:gap-2 lg:gap-3 max-w-full overflow-hidden">
                <button
                  onClick={() => handleNavigate('lobby')}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                    currentPage === 'lobby'
                      ? 'mystical-button neon-glow'
                      : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-xs">{t('nav.lobby')}</span>
                </button>
                
                <button
                  onClick={() => handleNavigate('game')}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                    currentPage === 'game'
                      ? 'mystical-button neon-glow'
                      : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <Sword className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform" />
                  <span className="hidden xs:inline text-xs">{t('nav.game')}</span>
                </button>
                
                <button
                  onClick={() => handleNavigate('scoreboard')}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                    currentPage === 'scoreboard'
                      ? 'mystical-button neon-glow'
                      : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-xs">{t('nav.scoreboard')}</span>
                </button>
                
                <button
                  onClick={() => handleNavigate('character')}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                    currentPage === 'character'
                      ? 'mystical-button neon-glow'
                      : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-xs">{t('nav.character')}</span>
                </button>
                
                <button
                  onClick={() => handleNavigate('inventory')}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                    currentPage === 'inventory'
                      ? 'mystical-button neon-glow'
                      : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-xs">{t('nav.inventory')}</span>
                </button>
                
                <button
                  onClick={() => handleNavigate('achievements')}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                    currentPage === 'achievements'
                      ? 'mystical-button neon-glow'
                      : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-xs">{t('nav.achievements')}</span>
                </button>
                
                {/* Language Toggle */}
                <button
                  onClick={() => {
                    const newLang = language === 'fa' ? 'en' : 'fa';
                    changeLanguage(newLang);
                  }}
                  className="group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 rounded-lg text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                  title={language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
                >
                  <Languages className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-xs font-medium">
                    {language === 'fa' ? 'EN' : 'فا'}
                  </span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="group flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 rounded-lg text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'تغییر به حالت روشن'}
                >
                  {actualTheme === 'dark' ? (
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="hidden xs:inline text-xs font-medium">
                    {actualTheme === 'dark' ? '🌙' : '☀️'}
                  </span>
                </button>
              </nav>
              
              {/* User Profile or Login Button */}
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center space-x-1 sm:space-x-2 space-x-reverse">
                      <div className="relative">
                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold tracking-wide">
                        {language === 'fa' ? 'ورود' : 'Log In'}
                      </span>
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <UnifiedAuth onClose={() => setShowAuthModal(false)} showBackButton={false} />
      )}
    </div>
  );
};