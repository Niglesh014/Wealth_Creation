import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePortfolio } from '../context/PortfolioContext';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = usePortfolio();

  const [fullName, setFullName] = useState<string>(user?.fullName || 'Niglesh Sundhar');
  const [email, setEmail] = useState<string>(user?.email || 'investor@wealthwise.com');
  const [currency, setCurrency] = useState<string>(user?.preferredCurrency || 'INR');
  const [dateFormat, setDateFormat] = useState<string>(user?.dateFormat || 'DD/MM/YYYY');
  const [emailNotifications, setEmailNotifications] = useState<boolean>(user?.emailNotifications ?? true);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pwSuccess, setPwSuccess] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      fullName,
      email,
      preferredCurrency: currency,
      dateFormat,
      emailNotifications
    });
    showToast('Preferences updated successfully!', 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setPwSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully!', 'success');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
          Settings & Account Preferences
        </h1>
        <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
          Manage your personal details, display preferences, notifications, and security credentials
        </p>
      </div>

      {/* Profile & Preferences Form */}
      <div className="bg-white dark:bg-fintech-cardDark p-6 rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
        <h2 className="text-base font-bold text-fintech-text dark:text-white mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-fintech-accent" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {fullName.charAt(0) || 'N'}
            </div>
            <div>
              <p className="font-bold text-sm text-fintech-text dark:text-white">{fullName}</p>
              <p className="text-xs text-gray-400">{email}</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Verified Investor Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-fintech-borderDark">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Regional & Display Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Visual Theme
                </label>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl text-fintech-text dark:text-white"
                >
                  <span className="capitalize">{theme} Theme</span>
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-4 border-t border-gray-100 dark:border-fintech-borderDark">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={e => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-fintech-accent focus:ring-fintech-accent border-gray-300"
              />
              <div>
                <span className="text-xs font-semibold text-fintech-text dark:text-white block">
                  Email Notifications for Dividends & Bond Coupons
                </span>
                <span className="text-[11px] text-gray-400">
                  Receive alerts when cash dividends and fixed-income interest payments are credited.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Section: Change Password & Sessions */}
      <div className="bg-white dark:bg-fintech-cardDark p-6 rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
        <h2 className="text-base font-bold text-fintech-text dark:text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>Security & Authentication</span>
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg mb-6">
          {pwSuccess && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Password successfully updated!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Update Password</span>
          </button>
        </form>

        {/* Active Session Info */}
        <div className="pt-4 border-t border-gray-100 dark:border-fintech-borderDark">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Active Sessions
          </h3>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-semibold text-fintech-text dark:text-white">Current Browser Session (Windows / Chrome)</p>
                <p className="text-[11px] text-gray-400">IP: 127.0.0.1 • Active Now</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
