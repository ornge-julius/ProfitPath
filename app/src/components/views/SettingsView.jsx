import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogIn, LogOut, ArrowRight, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useDemoMode } from '../../context/DemoModeContext';

const SettingsView = ({
  isAuthenticated,
  user,
  onSignIn,
  onSignOut,
  startingBalance,
  onUpdateStartingBalance,
  selectedAccountName
}) => {
  const { toggleTheme, isDark } = useTheme();
  const { isDemoMode } = useDemoMode();
  const [balanceInput, setBalanceInput] = useState(startingBalance ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBalanceInput(startingBalance ?? '');
  }, [startingBalance]);

  const handleBalanceSubmit = (e) => {
    e.preventDefault();
    onUpdateStartingBalance(balanceInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page Header */}
      <div className="pt-4">
        <h1 className="font-display text-display-md text-text-primary mb-2">Settings</h1>
        <p className="font-mono text-sm text-text-muted">Preferences and session</p>
      </div>

      {/* Appearance */}
      <div className="card-luxe p-6">
        <h3 className="font-display text-xl text-text-primary mb-1">Appearance</h3>
        <p className="font-mono text-xs text-text-muted mb-5">Choose how ProfitPath looks on this device</p>
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:border-border-accent bg-bg-surface hover:bg-bg-elevated transition-all"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-4 w-4 text-gold" /> : <Sun className="h-4 w-4 text-gold" />}
            <span className="font-mono text-sm text-text-primary">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-gold' : 'bg-border'}`}>
            <span
              className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-bg-primary shadow-sm transition-transform ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Account Balance */}
      <div className="card-luxe p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-display text-xl text-text-primary mb-1">Starting Balance</h3>
            <p className="font-mono text-xs text-text-muted">
              For {selectedAccountName || 'the active account'} — managing multiple accounts? Visit{' '}
              <Link to="/accounts" className="text-gold hover:text-gold-light transition-colors">
                Accounts
              </Link>
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleBalanceSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="label-luxe">Balance</label>
              <input
                type="number"
                step="0.01"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="50000"
                className="input-luxe"
              />
            </div>
            <button type="submit" className="btn-primary sm:w-auto">
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </form>
        ) : (
          <p className="font-mono text-xs text-text-muted">Sign in to edit your account balance.</p>
        )}
      </div>

      {/* Session */}
      <div className="card-luxe p-6">
        <h3 className="font-display text-xl text-text-primary mb-5">Session</h3>

        {isDemoMode && (
          <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-lg border border-border-subtle bg-bg-surface">
            <Eye className="w-4 h-4 text-gold flex-shrink-0" />
            <p className="font-mono text-xs text-text-secondary">
              You're viewing read-only demo data. Sign in to track your own trades.
            </p>
          </div>
        )}

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-bg-surface">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-bg-primary font-mono text-sm font-semibold flex-shrink-0">
                {user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-sm text-text-primary truncate">{user?.email}</span>
                <span className="font-mono text-xs text-text-muted">Authenticated</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        )}
      </div>

      {/* Quick link to Tags */}
      <Link
        to="/tags"
        className="card-luxe p-5 flex items-center justify-between hover:border-border-accent transition-all group"
      >
        <div>
          <span className="font-mono text-sm text-text-primary group-hover:text-gold transition-colors">Manage Tags</span>
          <p className="font-mono text-xs text-text-muted mt-0.5">Create and organize strategy tags</p>
        </div>
        <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors" />
      </Link>
    </div>
  );
};

export default SettingsView;
