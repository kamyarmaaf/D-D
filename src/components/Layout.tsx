import React from 'react';
import { Sword, Users, Trophy, Languages, Sparkles, Settings, User, Package, Award, Sun, Moon, Monitor } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements' | 'dice-test';
  onNavigate: (page: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements' | 'dice-test') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, setTheme, actualTheme } = useTheme();

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative">
                <Sword className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-amber-600 group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg" />
                <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 text-amber-500 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 animate-pulse drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold gradient-text">{t('app.title')}</h1>
                <p className="text-xs text-ink-muted hidden md:block drop-shadow-lg">{t('app.subtitle')}</p>
              </div>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-1 sm:gap-2 lg:gap-3">
              <button
                onClick={() => onNavigate('lobby')}
                    className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium rounded-lg ${
                      currentPage === 'lobby'
                        ? 'mystical-button neon-glow'
                        : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                    }`}
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t('nav.lobby')}</span>
              </button>
              
              <button
                onClick={() => onNavigate('game')}
                    className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium ${
                      currentPage === 'game'
                        ? 'mystical-button neon-glow'
                        : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg rounded-lg backdrop-blur-sm'
                    }`}
              >
                <Sword className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">{t('nav.game')}</span>
              </button>
              
              <button
                onClick={() => onNavigate('scoreboard')}
                    className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium ${
                      currentPage === 'scoreboard'
                        ? 'mystical-button neon-glow'
                        : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg rounded-lg backdrop-blur-sm'
                    }`}
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t('nav.scoreboard')}</span>
              </button>

                    <div className="h-6 w-px bg-amber-400/50 mx-3"></div>

              <button
                onClick={() => onNavigate('character')}
                    className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium ${
                      currentPage === 'character'
                        ? 'mystical-button neon-glow'
                        : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg rounded-lg backdrop-blur-sm'
                    }`}
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                       <span className="hidden sm:inline">{t('nav.character')}</span>
              </button>

              <button
                onClick={() => onNavigate('inventory')}
                    className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium ${
                      currentPage === 'inventory'
                        ? 'mystical-button neon-glow'
                        : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg rounded-lg backdrop-blur-sm'
                    }`}
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                       <span className="hidden sm:inline">{t('nav.inventory')}</span>
              </button>

              <button
                onClick={() => onNavigate('achievements')}
                    className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 transition-all duration-300 text-xs sm:text-sm font-medium ${
                      currentPage === 'achievements'
                        ? 'mystical-button neon-glow'
                        : 'text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 hover:scale-105 hover:shadow-lg rounded-lg backdrop-blur-sm'
                    }`}
              >
                <Award className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t('nav.achievements')}</span>
              </button>



                    <div className="h-6 w-px bg-amber-400/50 mx-3"></div>

              <button
                onClick={() => changeLanguage(language === 'en' ? 'fa' : 'en')}
                className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                title="Toggle Language"
              >
                <Languages className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs sm:text-sm font-semibold">{language.toUpperCase()}</span>
              </button>

              <button
                onClick={() => {
                  const themes: ('dark' | 'light' | 'system')[] = ['dark', 'light', 'system'];
                  const currentIndex = themes.indexOf(theme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  setTheme(themes[nextIndex]);
                }}
                className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                title={`Theme: ${theme} (${actualTheme})`}
              >
                {actualTheme === 'dark' ? (
                  <Moon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform duration-300" />
                ) : actualTheme === 'light' ? (
                  <Sun className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform duration-300" />
                ) : (
                  <Monitor className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </button>

              <button
                className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg text-ink hover:text-ink-light hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-100/80 border border-amber-300/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                title="Settings"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="relative container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};