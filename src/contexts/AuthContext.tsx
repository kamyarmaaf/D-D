import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseGameDatabase } from '../database/supabaseGameDatabase';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  googleId?: string;
  authProvider?: 'google' | 'email';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => void;
  registerWithEmail: (email: string, password: string, username: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('dnd_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dnd_user');
    // Clear game state on logout
    localStorage.removeItem('dnd_game_state');
    localStorage.removeItem('dnd_messages');
    localStorage.removeItem('dnd_current_stage');
    localStorage.removeItem('dnd_stage_history');
    localStorage.removeItem('dnd_current_story_text');
  };

  const checkAuth = () => {
    try {
      const savedUser = localStorage.getItem('dnd_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('dnd_user');
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Authentication
  const registerWithEmail = async (email: string, password: string, username: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: username,
        email: email,
        authProvider: 'email'
      };

      // For now, we'll use localStorage as a fallback
      // In production, this should be handled by Supabase Auth
      const existingUsers = JSON.parse(localStorage.getItem('dnd_users') || '[]');
      const userExists = existingUsers.find((u: any) => u.email === email);
      
      if (userExists) {
        throw new Error('کاربری با این ایمیل قبلاً ثبت‌نام کرده است');
      }

      // Save user to local storage (in a real app, this would be sent to server)
      existingUsers.push({
        ...newUser,
        password: password // In real app, this should be hashed
      });
      localStorage.setItem('dnd_users', JSON.stringify(existingUsers));

      // Log in the user
      login(newUser);
      
      // TODO: Record activity in database
      // await supabaseGameDatabase.recordUserActivity(newUser.id, 'login', { method: 'email' });
    } catch (error: any) {
      throw new Error(error.message || 'خطا در ثبت‌نام');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const existingUsers = JSON.parse(localStorage.getItem('dnd_users') || '[]');
      const user = existingUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('ایمیل یا رمز عبور اشتباه است');
      }

      // Remove password from user object before logging in
      const { password: _, ...userWithoutPassword } = user;
      login(userWithoutPassword);
    } catch (error: any) {
      throw new Error(error.message || 'خطا در ورود');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    registerWithEmail,
    loginWithEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
