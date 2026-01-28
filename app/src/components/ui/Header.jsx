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
    <header className={`fixed left-0 right-0 z-30 transition-[top] duration-200 ${isDemoMode ? 'top-20 sm:top-11' : 'top-0'}`}>
      {/* Glass background with subtle border */}
      <div className="absolute inset-0 bg-bg-primary/90 backdrop-blur-xl border-b border-border-subtle" />
      
      <nav className="relative max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center group">
            <span className="font-display text-2xl tracking-tight text-text-primary group-hover:text-gold transition-colors duration-300">
              Profit<span className="text-gold">Path</span>
            </span>
          </Link>

          {/* Filters - Center */}
          {showTagFilter && (
            <div className="hidden sm:flex items-center gap-4 flex-1 justify-center max-w-md mx-8">
              <GlobalDateFilter variant="navbar" />
              <div className="w-px h-5 bg-border" />
              <GlobalTagFilter variant="navbar" />
            </div>
          )}

          {/* Right side - Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile filters */}
            {showTagFilter && (
              <div className="flex sm:hidden items-center gap-2">
                <GlobalDateFilter variant="navbar" />
                <GlobalTagFilter variant="navbar" />
              </div>
            )}

            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:border-gold/50 hover:bg-gold/5 transition-all duration-200 focus:outline-none focus-ring"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-text-secondary" />
              ) : (
                <Menu className="h-5 w-5 text-text-secondary" />
              )}
            </button>

            <SwipeableDrawer
              anchor="right"
              open={isMenuOpen}
              onClose={closeMenu}
              onOpen={openMenu}
              disableDiscovery
              ModalProps={{ keepMounted: true }}
              PaperProps={{
                className: 'w-full max-w-sm',
                sx: { 
                  backgroundColor: 'transparent', 
                  boxShadow: 'none',
                }
              }}
            >
              {/* Drawer Content */}
              <div className="h-full bg-bg-card border-l border-border">
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <span className="font-display text-xl text-text-primary">Menu</span>
                  <button
                    onClick={closeMenu}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
                  >
                    <X className="h-4 w-4 text-text-muted" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)]">
                  {/* Accounts Section */}
                  <div>
                    <p className="label-luxe mb-4">Accounts</p>
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

                  {/* Divider */}
                  <div className="divider" />

                  {/* Appearance Section */}
                  <div>
                    <p className="label-luxe mb-4">Appearance</p>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:border-border-accent bg-bg-surface hover:bg-bg-elevated transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Moon className="h-4 w-4 text-gold" />
                        ) : (
                          <Sun className="h-4 w-4 text-gold" />
                        )}
                        <span className="font-mono text-sm text-text-primary">
                          {isDark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                      </div>
                      <div className={`relative w-10 h-5 rounded-full transition-colors ${
                        isDark ? 'bg-gold' : 'bg-border'
                      }`}>
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg-primary shadow-sm transition-transform ${
                            isDark ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="divider" />

                  {/* Authentication Section */}
                  <div>
                    <p className="label-luxe mb-4">Account</p>
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        {/* User info card */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-bg-surface">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-bg-primary font-mono text-sm font-semibold">
                            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono text-sm text-text-primary truncate">
                              {user?.email}
                            </span>
                            <span className="font-mono text-xs text-text-muted">Authenticated</span>
                          </div>
                        </div>
                        
                        {/* Sign out button */}
                        <button
                          type="button"
                          onClick={handleSignOutClick}
                          className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSignInClick}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </button>
                    )}
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
