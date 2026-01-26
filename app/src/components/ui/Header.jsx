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
import { useDemoMode } from '../../context/DemoModeContext';
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
  const { isDemoMode } = useDemoMode();

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
    <header className={`fixed left-0 right-0 z-30 backdrop-blur-lg bg-white/95 dark:bg-gray-600/80 shadow-lg hover:shadow-xl pb-3 transition-[top] duration-200 ${isDemoMode ? 'top-20 sm:top-11' : 'top-0'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex h-16 items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 flex-shrink-0 self-center">
            <Link to="/" className="flex items-center">
              <img
                src={logoImage}
                alt="ProfitPath Logo"
                className="h-28 w-auto mt-2"
              />
            </Link>
          </div>

          {showTagFilter && (
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end mr-2 sm:mr-0">
              <GlobalDateFilter variant="navbar" />
              <GlobalTagFilter variant="navbar" />
            </div>
          )}

          <div className="relative flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#10B981] border border-[#10B981] dark:border-black text-black dark:text-black shadow-lg transition-all hover:bg-gray-50 dark:hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
              <div className="flex h-full flex-col rounded-l-3xl border-l border-gray-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95">
                <div className="px-5 py-6 max-h-full overflow-y-auto space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Accounts</p>
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Appearance</p>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="mt-4 flex w-full items-center justify-between rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Authentication</p>
                      <div className="mt-4 space-y-3">
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/70">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-sm font-semibold text-white">
                                {user?.email?.charAt(0)?.toUpperCase() || 'TJ'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Signed in</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSignOutClick}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSignInClick}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-500 hover:to-emerald-500 dark:hover:from-blue-500 dark:hover:to-emerald-500"
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
