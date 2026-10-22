import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { DashboardPage } from './pages/DashboardPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { StocksPage } from './pages/StocksPage';
import { BondsPage } from './pages/BondsPage';
import { MutualFundsPage } from './pages/MutualFundsPage';
import { ETFsPage } from './pages/ETFsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { ReportsPage } from './pages/ReportsPage';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fintech-bg dark:bg-fintech-darkBg">
        <div className="w-8 h-8 border-4 border-fintech-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Dashboard Layout Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="stocks" element={<StocksPage />} />
                <Route path="bonds" element={<BondsPage />} />
                <Route path="mutual-funds" element={<MutualFundsPage />} />
                <Route path="etfs" element={<ETFsPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="watchlist" element={<WatchlistPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
