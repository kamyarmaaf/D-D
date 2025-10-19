import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LobbyPage } from './components/pages/LobbyPage';
import { GamePage } from './components/pages/GamePage';
import { ScoreboardPage } from './components/pages/ScoreboardPage';
import { CharacterPage } from './components/pages/CharacterPage';
import { InventoryPage } from './components/pages/InventoryPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useEnhancedGameStore } from './store/enhancedGameStore';
import { Achievement } from './types/game';

function AppContent() {
  const { isLoading: isAuthLoading } = useAuth();
  const {
    currentPlayer,
    achievements,
    setCurrentPlayer,
    addAchievement
  } = useEnhancedGameStore();

  // Show loading screen while checking authentication
  const isLoading = isAuthLoading;

  // Initialize demo data
  useEffect(() => {
    if (!currentPlayer) {
      setCurrentPlayer({
        id: 'demo-player',
        nickname: 'Demo Player',
        age: 25,
        genre: 'Fantasy',
        score: 0,
        titles: [],
        isHost: false,
        achievements: [],
        level: 1,
        experience: 0
      });
    }
  }, [currentPlayer, setCurrentPlayer]);

  // Add some demo achievements for testing
  useEffect(() => {
    if (achievements.length === 0) {
      const demoAchievements: Achievement[] = [
        {
          id: 'first-login',
          name: 'First Steps',
          description: 'Welcome to the adventure!',
          icon: '🌟',
          points: 5,
          unlockedAt: new Date(),
          category: 'story'
        },
        {
          id: 'explorer',
          name: 'Explorer',
          description: 'Discover new lands and secrets',
          icon: '🗺️',
          points: 15,
          unlockedAt: new Date(),
          category: 'exploration'
        },
        {
          id: 'warrior',
          name: 'Warrior',
          description: 'Prove your combat skills',
          icon: '⚔️',
          points: 20,
          unlockedAt: new Date(),
          category: 'combat'
        }
      ];
      
      demoAchievements.forEach(achievement => addAchievement(achievement));
    }
  }, [achievements.length, addAchievement]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-ink-muted">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/scoreboard" element={<ScoreboardPage />} />
          <Route path="/character" element={<CharacterPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <PWAInstallPrompt />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;