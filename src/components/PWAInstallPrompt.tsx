import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed in this session
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="glass-card p-4 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-sm border border-purple-400/50">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Install D&D Bolt
            </h3>
            <p className="text-xs text-purple-100 mb-3">
              Install this app on your device for a better gaming experience!
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
