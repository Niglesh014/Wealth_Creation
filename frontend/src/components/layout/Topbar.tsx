import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Menu,
  User as UserIcon,
  ChevronDown,
  TrendingUp,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ALL_SAMPLE_ASSETS } from '../../data/sampleAssets';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface TopbarProps {
  onToggleMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? ALL_SAMPLE_ASSETS.filter(
        a =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectAsset = (asset: any) => {
    setSearchQuery('');
    setSearchOpen(false);
    if (asset.assetType === 'Stock') navigate('/stocks');
    else if (asset.assetType === 'Bond') navigate('/bonds');
    else if (asset.assetType === 'MutualFund') navigate('/mutual-funds');
    else if (asset.assetType === 'ETF') navigate('/etfs');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-fintech-cardDark/90 backdrop-blur-md border-b border-fintech-border dark:border-fintech-borderDark px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-lg">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-fintech-secondaryText hover:text-fintech-text dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div ref={searchRef} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks, bonds, funds, or ETFs..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-10 pr-8 py-2 text-xs bg-fintech-bg dark:bg-slate-800/80 border border-fintech-border dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-gray-100 dark:divide-slate-800">
              {searchResults.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAsset(item)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-fintech-text dark:text-white">
                        {item.ticker}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.assetType}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {item.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-fintech-text dark:text-white block">
                      {formatINR(item.currentPrice)}
                    </span>
                    <span className={`text-[10px] font-semibold ${item.dailyChangePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {item.dailyChangePercent >= 0 ? '+' : ''}{item.dailyChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center space-x-2 sm:space-x-3 ml-4">
        {/* Market Status Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NSE / BSE: OPEN</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Help Icon */}
        <button
          onClick={() => setHelpOpen(true)}
          title="Platform Guide & Educational Disclaimer"
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notification Icon */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-fintech-cardDark border border-gray-100 dark:border-fintech-borderDark rounded-2xl shadow-xl p-3 z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800 mb-2">
                <span className="font-bold text-fintech-text dark:text-white">Notifications</span>
                <span className="text-[10px] text-emerald-600 font-semibold">2 New</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold text-fintech-text dark:text-white">Dividend Credited</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">TCS interim dividend of ₹280.00 received.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold text-fintech-text dark:text-white">Bond Interest Paid</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Corporate bond coupon of ₹825.00 settled.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.fullName?.charAt(0) || 'N'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-fintech-text dark:text-white leading-tight">
                {user?.fullName || 'Investor'}
              </p>
              <p className="text-[10px] text-fintech-secondaryText dark:text-gray-400 leading-tight">
                {user?.email || 'Demo Portfolio'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-fintech-cardDark border border-gray-100 dark:border-fintech-borderDark rounded-2xl shadow-xl py-1 z-50 text-xs">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                <p className="font-bold text-fintech-text dark:text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
              >
                Settings & Preferences
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/goals');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
              >
                Financial Goals
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Help Modal */}
      <Modal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="WealthWise Investor Portal Guide"
        subtitle="Platform architecture, formulas, and educational disclosures"
      >
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200">
            <h4 className="font-bold mb-1">Demonstration & Educational Portal</h4>
            <p>
              WealthWise is designed as an enterprise portfolio management system. All market prices, bond ratings, and projections are simulated illustrations for educational and demonstration purposes.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-fintech-text dark:text-white mb-1.5">Core Financial Formulas</h4>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-fintech-borderDark">
              <li>Total Invested = Quantity × Avg Purchase Price</li>
              <li>Market Value = Quantity × Current Market Price</li>
              <li>Unrealized P/L = Market Value − Total Invested</li>
              <li>Return % = (Unrealized P/L / Total Invested) × 100</li>
              <li>Annual Coupon = Principal × Coupon Rate / 100</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-fintech-text dark:text-white mb-1">ASP.NET Core OOP Architecture</h4>
            <p>
              The backend demonstrates object-oriented programming in C#: Polymorphic asset returns (Stock, Bond, Mutual Fund, ETF), Portfolio Indexer (<code>portfolio["TCS"]</code>), encapsulated aggregations, and Entity Framework Core relational database mapping with SQL Server.
            </p>
          </div>
        </div>
      </Modal>
    </header>
  );
};
