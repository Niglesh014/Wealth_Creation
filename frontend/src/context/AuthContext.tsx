import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { loadStoredUser, saveStoredUser } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  demoLogin: () => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = loadStoredUser();
    setUser(saved);
    setIsLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    // Authenticate user
    const loggedUser: UserProfile = {
      id: 1,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email.trim().toLowerCase(),
      preferredCurrency: 'INR',
      themePreference: 'light',
      dateFormat: 'DD/MM/YYYY',
      emailNotifications: true,
      createdAt: '2026-01-01'
    };

    setUser(loggedUser);
    saveStoredUser(loggedUser);
    return true;
  };

  const demoLogin = () => {
    const demo: UserProfile = {
      id: 1,
      fullName: 'Niglesh Sundhar',
      email: 'investor@wealthwise.com',
      preferredCurrency: 'INR',
      themePreference: 'light',
      dateFormat: 'DD/MM/YYYY',
      emailNotifications: true,
      createdAt: '2026-01-01'
    };
    setUser(demo);
    saveStoredUser(demo);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wealthwise_user');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    saveStoredUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
