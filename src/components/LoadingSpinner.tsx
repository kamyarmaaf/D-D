import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-gold',
    secondary: 'border-mystic',
    white: 'border-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-300/20`}></div>
        
        {/* Inner rotating ring */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-2 ${colorClasses[color]} border-t-transparent animate-spin`}></div>
        
        {/* Center pulsing dot */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 ${color === 'white' ? 'bg-white' : 'bg-gold'} rounded-full animate-pulse`}></div>
      </div>
      
      {/* Loading text */}
      {text && (
        <div className="text-center">
          <p className={`text-sm font-medium ${color === 'white' ? 'text-white' : 'text-gold'} animate-pulse`}>
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

// Specialized loading components for different use cases
export const GenreLoadingSpinner: React.FC<{ text?: string }> = ({ text = 'در حال آماده‌سازی داستان...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      {/* Large magical spinner */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute -inset-4 bg-gradient-to-r from-gold/40 to-mystic/40 dark:from-gold/20 dark:to-mystic/20 rounded-full blur-lg animate-pulse"></div>
        
        {/* Additional glow rings */}
        <div className="absolute -inset-2 bg-gradient-to-r from-mystic/30 to-gold/30 dark:from-mystic/10 dark:to-gold/10 rounded-full blur-md animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Main spinner */}
        <div className="relative h-16 w-16">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gold/40 dark:border-gold/20"></div>
          
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-mystic animate-spin"></div>
          
          {/* Counter-rotating ring */}
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-mystic border-l-gold animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-gold to-mystic rounded-full animate-pulse"></div>
          
          {/* Center sparkle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-ink dark:bg-ink-light rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Loading text with typewriter effect */}
      <div className="text-center">
        <p className="text-lg font-semibold text-ink dark:text-ink-light mb-2 animate-pulse">
          {text}
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-mystic rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {/* Additional loading dots */}
        <div className="mt-2 flex items-center justify-center space-x-1">
          <div className="w-1 h-1 bg-ink/80 dark:bg-ink-light/60 rounded-full animate-ping"></div>
          <div className="w-1 h-1 bg-ink/80 dark:bg-ink-light/60 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-ink/80 dark:bg-ink-light/60 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-32 h-1 bg-ink/40 dark:bg-ink-light/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold to-mystic rounded-full animate-pulse"></div>
        </div>
        
        {/* Loading text with typewriter effect */}
        <div className="mt-2 text-xs text-ink-muted dark:text-ink-light animate-pulse">
          لطفاً منتظر بمانید...
        </div>
      </div>
    </div>
  );
};

// Overlay loading component
export const LoadingOverlay: React.FC<{ 
  isVisible: boolean; 
  text?: string;
  onClick?: () => void;
}> = ({ isVisible, text = 'در حال بارگذاری...', onClick }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={onClick}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold/40 dark:bg-gold/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-mystic/40 dark:bg-mystic/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gold/30 dark:bg-gold/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-mystic/30 dark:bg-mystic/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="bg-gradient-to-br from-parchment to-parchment-dark dark:from-parchment-dark/90 dark:to-parchment/90 rounded-2xl p-8 border border-gold/30 backdrop-blur-sm animate-in zoom-in-95 duration-300 relative shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 to-mystic/40 dark:from-gold/20 dark:to-mystic/20 rounded-2xl blur-sm -z-10"></div>
        
        <GenreLoadingSpinner text={text} />
      </div>
    </div>
  );
};
