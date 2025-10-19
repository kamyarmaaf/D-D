import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { DatabaseInitializer } from './components/DatabaseInitializer';
import './index.css';

// Import test function for debugging
import { testDatabaseConnection } from './database/testConnection';

// Make test function available in console
if (import.meta.env.DEV) {
  (window as any).testDB = testDatabaseConnection;
  console.log('🧪 تابع تست دیتابیس آماده است!');
  console.log('💡 برای تست، در Console تایپ کنید: testDB()');
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use Vite PWA's auto-generated service worker
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DatabaseInitializer>
        <App />
      </DatabaseInitializer>
    </ThemeProvider>
  </StrictMode>
);
