import React, { useMemo, useState } from 'react';
import { Plus, Settings, Trash2, CheckCircle2, LogIn } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';
import AccountComparisonChart from '../charts/AccountComparisonChart';

const formatCurrency = (value) => {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const AccountsView = ({
  accounts,
  selectedAccountId,
  activeAccountBalance,
  onSelectAccount,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  isAuthenticated,
  onSignIn
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(null);

  // The active account's live balance reflects its actual trades; other accounts
  // fall back to their last-synced stored balance since their trades aren't loaded here.
  const resolvedAccounts = useMemo(() => accounts.map((account) => ({
    ...account,
    resolvedBalance: account.id === selectedAccountId && typeof activeAccountBalance === 'number'
      ? activeAccountBalance
      : (account.currentBalance || 0)
  })), [accounts, selectedAccountId, activeAccountBalance]);

  const comparisonData = useMemo(() => resolvedAccounts.map((account) => ({
    name: account.name,
    startingBalance: account.startingBalance || 0,
    currentBalance: account.resolvedBalance
  })), [resolvedAccounts]);

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    if (newAccountName.trim() && newAccountBalance) {
      onAddAccount({
        name: newAccountName.trim(),
        startingBalance: parseFloat(newAccountBalance),
        currentBalance: parseFloat(newAccountBalance)
      });
      setNewAccountName('');
      setNewAccountBalance('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pt-4">
        <div>
          <h1 className="font-display text-display-md text-text-primary mb-2">Accounts</h1>
          <p className="font-mono text-sm text-text-muted">Manage and compare your trading accounts</p>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Account
          </button>
        ) : (
          <button onClick={onSignIn} className="btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>

      {/* Add Account Form */}
      {showAddForm && isAuthenticated && (
        <div className="card-luxe p-6">
          <h3 className="font-display text-xl text-text-primary mb-5">New Account</h3>
          <form onSubmit={handleAddAccount} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <label className="label-luxe">Account Name</label>
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., Roth IRA"
                className="input-luxe"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="label-luxe">Starting Balance</label>
              <input
                type="number"
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(e.target.value)}
                placeholder="50000"
                step="0.01"
                min="0"
                className="input-luxe"
                required
              />
            </div>
            <div className="sm:col-span-1 flex gap-3">
              <button type="submit" className="btn-primary flex-1">Add</button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="card-luxe p-12 text-center">
          <p className="font-mono text-sm text-text-muted">
            {isAuthenticated ? 'No accounts yet. Create one to start journaling trades.' : 'Sign in to view your accounts.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resolvedAccounts.map((account) => {
            const isSelected = account.id === selectedAccountId;
            const currentBalance = account.resolvedBalance;
            const netChange = currentBalance - (account.startingBalance || 0);
            const netChangePct = account.startingBalance
              ? (netChange / account.startingBalance) * 100
              : 0;
            const isProfit = netChange > 0;
            const isLoss = netChange < 0;

            return (
              <div
                key={account.id}
                className={`card-luxe p-5 group relative ${isSelected ? 'border-gold/50' : ''}`}
              >
                {isSelected && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-gold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onSelectAccount(account.id)}
                  className="text-left w-full"
                >
                  <span className="font-display text-xl text-text-primary hover:text-gold transition-colors block mb-4 pr-16">
                    {account.name}
                  </span>

                  <span className="stat-label mb-1 block">Current Balance</span>
                  <p className="font-display text-3xl text-text-primary tracking-tight mb-3">
                    {formatCurrency(currentBalance)}
                  </p>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-text-muted">
                      Started at {formatCurrency(account.startingBalance)}
                    </span>
                    <span className={isProfit ? 'text-gold' : isLoss ? 'text-loss' : 'text-text-muted'}>
                      {isProfit ? '+' : ''}{netChangePct.toFixed(1)}%
                    </span>
                  </div>
                </button>

                {isAuthenticated && (
                  <div className="flex gap-1 mt-4 pt-4 border-t border-border-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditAccount(account)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-gold transition-all font-mono text-xs"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => setDeletingAccount(account)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-loss transition-all font-mono text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Chart */}
      {accounts.length > 1 && (
        <div className="card-luxe p-5 sm:p-6">
          <h3 className="font-display text-xl text-text-primary mb-1">Starting vs Current Balance</h3>
          <p className="font-mono text-xs text-text-muted mb-2">
            How each account has moved from its starting point
            {activeAccountBalance != null ? ` — ${resolvedAccounts.find((a) => a.id === selectedAccountId)?.name || 'the active account'} reflects live trade data, others show last-synced balances` : ''}
          </p>
          <AccountComparisonChart data={comparisonData} />
        </div>
      )}

      {deletingAccount && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingAccount(null)}
          onConfirm={() => {
            onDeleteAccount(deletingAccount.id);
            setDeletingAccount(null);
          }}
          title="Delete Account"
          message={`Are you sure you want to delete "${deletingAccount.name}"? This does not delete its trades, but you will lose access to this account view.`}
          confirmText="Delete Account"
          cancelText="Cancel"
          confirmButtonColor="bg-loss hover:bg-loss/80"
        />
      )}
    </div>
  );
};

export default AccountsView;
