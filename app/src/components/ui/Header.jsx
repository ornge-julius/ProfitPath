import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import AccountSelector from './AccountSelector';
import GlobalDateFilter from './GlobalDateFilter';
import GlobalTagFilter from './GlobalTagFilter';
import { useTheme } from '../../context/ThemeContext';
import logoImage from '../../assets/FullLogo_Transparent.png';

const Header = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  isAuthenticated,
  user,
  onSignIn,
  onSignOut,
  showTagFilter = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);
  const openMenu = () => setIsMenuOpen(true);

  const handleSelectAccount = (accountId) => {
    onSelectAccount(accountId);
    closeMenu();
  };

  const handleSignInClick = () => {
    closeMenu();
    onSignIn();
  };

  const handleSignOutClick = () => {
    closeMenu();
    onSignOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 shadow-lg border-b border-white/40 dark:border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex h-20 items-center justify-between gap-6 w-full">
          <div className="flex items-center gap-3 flex-shrink-0 self-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/40 to-blue-500/40 blur-xl group-hover:opacity-100 opacity-80 transition-opacity" />
                <img
                  src={logoImage}
                  alt="ProfitPath Logo"
                  className="relative h-20 w-auto drop-shadow-lg"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300 font-semibold">ProfitPath</span>
                <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-tight">Precision trading, elevated</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Curated analytics & journaling</span>
              </div>
            </Link>
          </div>

          {showTagFilter && (
            <div className="hidden md:flex items-center gap-2 sm:gap-3 flex-1 justify-end mr-2 sm:mr-0">
              <GlobalDateFilter variant="navbar" />
              <GlobalTagFilter variant="navbar" />
            </div>
          )}

          <div className="relative flex items-center gap-3 sm:gap-4">
            {showTagFilter && (
              <div className="md:hidden flex items-center gap-2">
                <GlobalDateFilter variant="navbar" />
                <GlobalTagFilter variant="navbar" />
              </div>
            )}
            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/40 bg-white/90 dark:bg-emerald-500/20 text-emerald-700 dark:text-white shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <SwipeableDrawer
              anchor="right"
              open={isMenuOpen}
              onClose={closeMenu}
              onOpen={openMenu}
              disableDiscovery
              ModalProps={{ keepMounted: true }}
              PaperProps={{
                className: 'w-full max-w-sm sm:max-w-md bg-transparent shadow-none',
                sx: { backgroundColor: 'transparent', boxShadow: 'none' }
              }}
            >
              <div className="flex h-full flex-col rounded-l-3xl gradient-border glass-panel">
                <div className="px-5 py-6 max-h-full overflow-y-auto space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-500">Accounts</p>
                    <div className="mt-4">
                      <AccountSelector
                        accounts={accounts}
                        selectedAccountId={selectedAccountId}
                        onSelectAccount={handleSelectAccount}
                        onAddAccount={onAddAccount}
                        onEditAccount={onEditAccount}
                        onDeleteAccount={onDeleteAccount}
                        isAuthenticated={isAuthenticated}
                        onSignIn={handleSignInClick}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-500">Appearance</p>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="mt-4 flex w-full items-center justify-between rounded-2xl bg-gray-100/90 dark:bg-slate-800/70 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:bg-gray-200/90 dark:hover:bg-slate-700/70"
                      >
                        <div className="flex items-center gap-2">
                          {isDark ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDark ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isDark ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </div>
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-500">Authentication</p>
                      <div className="mt-4 space-y-3">
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-gray-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
                                {user?.email?.charAt(0)?.toUpperCase() || 'TJ'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Signed in</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSignOutClick}
                              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100/80 dark:bg-slate-800/80 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-200 transition-colors hover:bg-gray-200/90 dark:hover:bg-slate-700/80"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSignInClick}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl button-primary px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-200"
                          >
                            <LogIn className="h-5 w-5" />
                            Sign In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwipeableDrawer>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
