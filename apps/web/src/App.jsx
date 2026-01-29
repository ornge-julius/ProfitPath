import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { createClient } from '@supabase/supabase-js';
import { SupabaseProvider, useTradeManagement, useAuth } from '@profitpath/shared';
import { useAppState } from './hooks/useAppState';
import Header from './components/ui/Header';
import TradeForm from './components/forms/TradeForm';
import SettingsForm from './components/forms/SettingsForm';
import AccountEditForm from './components/forms/AccountEditForm';
import SignInForm from './components/forms/SignInForm';
import DashboardView from './components/views/DashboardView';
import TradeBatchComparisonView from './components/views/TradeBatchComparisonView';
import TagsManagementView from './components/views/TagsManagementView';
import TradeHistoryView from './components/views/TradeHistoryView';
import TradeDetailPage from './components/views/TradeDetailPage';
import { DateFilterProvider } from './context/DateFilterContext';
import { TagFilterProvider } from './context/TagFilterContext';
import { TagProvider } from './context/TagContext';
import { ThemeProvider } from './context/ThemeContext';
import { DemoModeProvider, useDemoMode } from './context/DemoModeContext';
import BottomNavDock from './components/ui/BottomNavDock';
import DemoModeBanner from './components/ui/DemoModeBanner';

function AppContent() {
  const [showAccountEditForm, setShowAccountEditForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showSignInForm, setShowSignInForm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Authentication state
  const { user, isAuthenticated, isLoading: authLoading, signInWithEmail, signOut } = useAuth();
  const { isDemoMode } = useDemoMode();

  const {
    startingBalance,
    showBalanceForm,
    showTradeForm,
    updateStartingBalance,
    toggleBalanceForm,
    toggleTradeForm,
    accounts,
    selectedAccountId,
    addAccount,
    updateAccount,
    deleteAccount,
    selectAccount
  } = useAppState();

  const {
    trades,
    editingTrade,
    addTrade,
    updateTrade,
    deleteTrade,
    setEditingTrade,
    clearEditingTrade
  } = useTradeManagement(selectedAccountId);

  // Check if account is still loading
  const isAccountLoading = accounts.length === 0 && selectedAccountId === null;
  const isDetailPage = location.pathname.startsWith('/detail');

  const ensureAuthenticated = () => {
    if (!isAuthenticated) {
      setShowSignInForm(true);
      return false;
    }
    return true;
  };

  const handleTradeSubmit = async (tradeData) => {
    if (!ensureAuthenticated()) {
      return false;
    }

    if (editingTrade) {
      const updatedTrade = await updateTrade({ ...editingTrade, ...tradeData });

      if (updatedTrade) {
        clearEditingTrade();

        if (showTradeForm) {
          toggleTradeForm();
        }

        return true;
      }

      return false;
    }

    const newTrade = await addTrade(tradeData);

    if (newTrade) {
      if (showTradeForm) {
        toggleTradeForm();
      }

      return true;
    }

    return false;
  };

  const handleTradeEdit = (trade) => {
    if (!ensureAuthenticated()) {
      return;
    }

    setEditingTrade(trade);

    if (!isDetailPage && !showTradeForm) {
      toggleTradeForm();
    }
  };

  const handleToggleTradeForm = () => {
    if (!ensureAuthenticated()) {
      return;
    }
    toggleTradeForm();
  };

  const handleCancelTradeForm = () => {
    clearEditingTrade();
    if (showTradeForm) {
      toggleTradeForm();
    }
  };

  const handleCancelDetailEdit = () => {
    clearEditingTrade();
  };

  const navigateBackFromDetail = () => {
    const from = location.state && typeof location.state === 'object' ? location.state.from : null;

    if (from) {
      navigate(from);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleTradeDelete = async (tradeId) => {
    if (!ensureAuthenticated()) {
      return false;
    }

    try {
      await deleteTrade(tradeId);

      if (editingTrade && editingTrade.id === tradeId) {
        clearEditingTrade();
        if (showTradeForm) {
          toggleTradeForm();
        }
      } else if (editingTrade) {
        clearEditingTrade();
      }

      const currentTradeId = location.pathname.startsWith('/detail/')
        ? location.pathname.replace('/detail/', '')
        : null;

      if (currentTradeId && String(currentTradeId) === String(tradeId)) {
        navigateBackFromDetail();
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const handleToggleSettings = () => {
    if (!showBalanceForm && !ensureAuthenticated()) {
      return;
    }
    toggleBalanceForm();
  };

  const handleUpdateBalance = (newBalance) => {
    if (!ensureAuthenticated()) {
      return;
    }
    updateStartingBalance(newBalance);
    toggleBalanceForm();
  };

  const handleAddAccount = async (accountData) => {
    if (!ensureAuthenticated()) {
      return;
    }
    try {
      await addAccount(accountData);
    } catch (error) {
      console.error('Failed to add account:', error);
    }
  };

  const handleEditAccount = (account) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setEditingAccount(account);
    setShowAccountEditForm(true);
  };

  const handleAccountEditSubmit = async (updatedAccount) => {
    if (!ensureAuthenticated()) {
      return;
    }
    try {
      await updateAccount(updatedAccount);
      setShowAccountEditForm(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!ensureAuthenticated()) {
      return;
    }
    if (accounts.length > 1) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const handleSelectAccount = (accountId) => {
    selectAccount(accountId);
  };

  // Authentication handlers
  const handleSignIn = () => {
    setShowSignInForm(true);
  };

  const handleSignInSubmit = async (email, password) => {
    await signInWithEmail(email, password);
    setShowSignInForm(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCloseSignInForm = () => {
    setShowSignInForm(false);
  };

  const MainLayout = () => {
    const showTagFilter = location.pathname === '/' || location.pathname === '/history';

    return (
      <>
        <DemoModeBanner onSignIn={handleSignIn} />
        <Header
          onToggleSettings={handleToggleSettings}
          onToggleTradeForm={handleToggleTradeForm}
          showTradeForm={showTradeForm}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={handleSelectAccount}
          onAddAccount={handleAddAccount}
          onEditAccount={handleEditAccount}
          onDeleteAccount={handleDeleteAccount}
          isAuthenticated={isAuthenticated}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          showTagFilter={showTagFilter}
        />

      {/* Settings Form */}
      <SettingsForm
        isOpen={showBalanceForm}
        onClose={handleToggleSettings}
        onSubmit={handleUpdateBalance}
        currentBalance={startingBalance}
      />

      {/* Trade Form */}
      <TradeForm
        isOpen={showTradeForm}
        onClose={toggleTradeForm}
        onSubmit={handleTradeSubmit}
        editingTrade={editingTrade}
        onCancel={handleCancelTradeForm}
        onDelete={handleTradeDelete}
      />

      {/* Account Edit Form */}
      <AccountEditForm
        isOpen={showAccountEditForm}
        onClose={() => {
          setShowAccountEditForm(false);
          setEditingAccount(null);
        }}
        onSubmit={handleAccountEditSubmit}
        account={editingAccount}
      />

      {/* Sign In Form */}
      <SignInForm
        isOpen={showSignInForm}
        onClose={handleCloseSignInForm}
        onSignIn={handleSignInSubmit}
      />

      {/* Loading State */}
      {authLoading ? (
        <div className={`flex flex-col items-center justify-center min-h-[60vh] ${isDemoMode ? 'pt-36 sm:pt-[118px]' : 'pt-24'}`}>
          <div className="spinner mb-4"></div>
          <p className="font-mono text-sm text-text-secondary tracking-wide">Loading authentication...</p>
        </div>
      ) : isAccountLoading ? (
        <div className={`flex flex-col items-center justify-center min-h-[60vh] ${isDemoMode ? 'pt-36 sm:pt-[118px]' : 'pt-24'}`}>
          <div className="spinner mb-4"></div>
          <p className="font-mono text-sm text-text-secondary tracking-wide">Loading account data...</p>
        </div>
      ) : !selectedAccountId ? (
        <div className={`flex flex-col items-center justify-center min-h-[60vh] ${isDemoMode ? 'pt-36 sm:pt-[118px]' : 'pt-24'}`}>
          <p className="font-display text-2xl text-text-primary mb-2">No Account Selected</p>
          <p className="font-mono text-sm text-text-muted">Select an account to view your trading data.</p>
        </div>
      ) : (
          <div className={isDemoMode ? 'pt-40 sm:pt-32' : 'pt-24'}>
            <Outlet />
          </div>
        )}
        
        {/* Bottom Navigation Dock */}
        <BottomNavDock
          onToggleTradeForm={handleToggleTradeForm}
          showTradeForm={showTradeForm}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden transition-colors duration-300">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-surface)' }} />
      
      {/* Main content */}
      <div className="relative z-10">
        <Routes>
          <Route
            path="/detail/:tradeId"
            element={
              <>
                <DemoModeBanner onSignIn={handleSignIn} />
                <div className={`max-w-6xl mx-auto px-6 sm:px-8 pb-24 ${isDemoMode ? 'pt-20 sm:pt-12' : 'pt-8'}`}>
                  <TradeDetailPage
                    trades={trades}
                    editingTrade={editingTrade}
                    onEdit={handleTradeEdit}
                    onSubmit={handleTradeSubmit}
                    onCancelEdit={handleCancelDetailEdit}
                    onDelete={handleTradeDelete}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
                {/* Sign In Form for detail page */}
                <SignInForm
                  isOpen={showSignInForm}
                  onClose={handleCloseSignInForm}
                  onSignIn={handleSignInSubmit}
                />
              </>
            }
          />
          <Route path="/" element={<MainLayout />}>
            <Route
              index
              element={
                <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-32">
                  <DashboardView
                    trades={trades}
                    startingBalance={startingBalance}
                  />
                </div>
              }
            />
            <Route
              path="comparison"
              element={
                <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-32">
                  <TradeBatchComparisonView
                    trades={trades}
                  />
                </div>
              }
            />
            <Route path="tags" element={
              <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-32">
                <TagsManagementView />
              </div>
            } />
            <Route
              path="history"
              element={
                <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-32">
                  <TradeHistoryView
                    trades={trades}
                    onToggleTradeForm={handleToggleTradeForm}
                  />
                </div>
              }
            />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
  return (
    <SupabaseProvider client={supabase}>
      <ThemeProvider>
        <DemoModeProvider>
          <DateFilterProvider>
            <TagFilterProvider>
              <TagProvider>
                <BrowserRouter>
                  <AppContent />
                  <SpeedInsights />
                  <Analytics />
                </BrowserRouter>
              </TagProvider>
            </TagFilterProvider>
          </DateFilterProvider>
        </DemoModeProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;
