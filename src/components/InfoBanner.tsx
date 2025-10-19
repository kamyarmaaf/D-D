import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Mail, Circle, Scroll, Star, Sword, Shield, Users, Crown, Sparkles } from 'lucide-react';

interface InfoBannerProps {
  icon?: React.ReactNode;
}

const InfoBanner: React.FC<InfoBannerProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseEnter = () => {
    if (!isKeyboardFocused) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isKeyboardFocused) {
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsKeyboardFocused(true);
  };

  const handleBlur = () => {
    setIsKeyboardFocused(false);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const getTransitionClasses = () => {
    if (prefersReducedMotion.current) {
      return 'transition-none';
    }
    return 'transition-all duration-700 ease-out';
  };


  return (
    <div 
      className="w-full max-w-4xl mx-auto mb-6 flex justify-center"
      aria-label="درباره بازی"
    >
      <div
        ref={bannerRef}
        className={`
          group relative overflow-hidden
          ${isExpanded ? 'w-full max-w-lg' : 'w-[200px] sm:w-[240px]'}
          ${isExpanded ? 'h-auto min-h-[250px] sm:min-h-[280px]' : 'h-[60px] sm:h-[70px]'}
          ${getTransitionClasses()}
          bg-gradient-to-b from-[#fff6e6] to-[#f5e7ca] dark:from-[#2d1b0e] dark:to-[#4a3424]
          border border-[#8b5a3c] dark:border-[#d4af37]
          rounded-lg
          shadow-lg
          hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
          cursor-pointer
          ${isExpanded ? 'rotate-0 scale-100' : 'rotate-1 hover:rotate-0 hover:scale-105'}
          transform-gpu
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-describedby={isExpanded ? "letter-content" : undefined}
      >
        {!isExpanded ? (
          // Closed Letter View
          <div className="flex items-center justify-between p-2 sm:p-3 h-full">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500/40 to-yellow-500/40 rounded-md flex items-center justify-center">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                </div>
                <Sparkles className="h-2 w-2 text-amber-500 absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink">About Game</h3>
                <p className="text-xs text-ink-muted">A Letter Awaits</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-ink-muted">
              <Circle className="h-3 w-3" />
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>
        ) : (
          // Open Letter Content
          <div className="p-2 sm:p-3">
            {/* Letter Header */}
            <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 dark:from-amber-600/30 dark:to-yellow-600/30 p-2 sm:p-3 mb-2 sm:mb-3 rounded-lg border border-amber-500/30 dark:border-amber-500/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500/40 to-yellow-500/40 rounded-md flex items-center justify-center">
                    <Scroll className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink">Tales of Adventure</h2>
                    <p className="text-xs text-ink-muted">A Letter from the Game Masters</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-ink-muted">
                  <Circle className="h-3 w-3" />
                  <ChevronDown className="h-3 w-3 rotate-180" />
                </div>
              </div>
            </div>

            {/* Letter Content */}
            <div id="letter-content" className="space-y-2 sm:space-y-3">
              {/* Greeting */}
              <div className="text-center border-b border-amber-500/20 pb-2 sm:pb-3">
                <div className="flex items-center justify-center space-x-1 mb-1 sm:mb-2">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                  <h3 className="text-sm sm:text-base font-bold text-ink">Dear Adventurer,</h3>
                </div>
                <p className="text-xs text-ink-muted italic">
                  Welcome to the realm of infinite possibilities...
                </p>
              </div>

              {/* Main Content */}
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <p className="text-xs text-ink leading-relaxed mb-1 sm:mb-2">
                    In <strong className="text-amber-600">Tales of Adventure</strong> you form a group and enter each chapter with the chapter code. 
                    Scores, inventory and achievements are updated live.
                  </p>
                  
                  <p className="text-xs text-ink leading-relaxed mb-1 sm:mb-2">
                    If you are the host, create a "new room" and share the chapter code with your friends; 
                    if you are a player, join the group by entering the code.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  {[
                    { icon: <Sword className="h-3 w-3" />, title: "Live Updates", desc: "Real-time scores" },
                    { icon: <Users className="h-3 w-3" />, title: "Multiplayer", desc: "Play with friends" },
                    { icon: <Shield className="h-3 w-3" />, title: "Inventory", desc: "Track equipment" },
                    { icon: <Star className="h-3 w-3" />, title: "Achievements", desc: "Unlock rewards" }
                  ].map((feature, index) => (
                    <div key={index} className="glass-card p-1.5 sm:p-2 hover:scale-105 transition-all duration-300">
                      <div className="flex items-start space-x-1">
                        <div className="text-amber-600 mt-0.5">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-ink mb-0.5">{feature.title}</h4>
                          <p className="text-xs text-ink-muted">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="text-center space-y-1 sm:space-y-2">
                  <p className="text-xs text-ink-muted italic">
                    "The greatest adventures begin with a single step into the unknown."
                  </p>
                  <div className="flex items-center justify-center space-x-1 text-amber-600">
                    <Star className="h-3 w-3" />
                    <span className="text-xs font-semibold">May your dice roll true!</span>
                    <Star className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="text-right border-t border-amber-500/20 pt-2 sm:pt-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-ink font-semibold">The Game Masters</p>
                  <p className="text-xs text-ink-muted">Crafters of Digital Adventures</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <Circle className="h-3 w-3 text-amber-600" />
                    <span className="text-xs text-ink-muted">Sealed with Magic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoBanner;
