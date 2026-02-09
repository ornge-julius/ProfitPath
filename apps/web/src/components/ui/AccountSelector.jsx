import React, { useState } from 'react';
import { ChevronDown, Plus, Settings, Trash2, LogIn } from 'lucide-react';

const AccountSelector = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  isAuthenticated,
  onSignIn
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  const handleRequireAuthentication = () => {
    setIsOpen(false);
    if (typeof onSignIn === 'function') {
      onSignIn();
    }
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      handleRequireAuthentication();
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

  const handleDeleteAccount = (accountId) => {
    if (!isAuthenticated) {
      handleRequireAuthentication();
      return;
    }
    if (accounts.length > 1) {
      onDeleteAccount(accountId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Account Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-bg-surface hover:bg-bg-elevated px-4 py-3 rounded-lg font-mono text-sm transition-colors flex items-center justify-between border border-border hover:border-border-accent text-text-primary"
      >
        <span className="truncate">
          {selectedAccount ? selectedAccount.name : 'Select Account'}
        </span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border rounded-lg shadow-luxe-lg z-50">
          {/* Current Account Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-text-primary">{selectedAccount?.name}</h3>
                <p className="font-mono text-xs text-text-muted">
                  ${selectedAccount?.currentBalance?.toLocaleString() || 0}
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => onEditAccount(selectedAccount)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-gold transition-all"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Account List */}
          <div className="max-h-48 overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`px-4 py-3 hover:bg-bg-elevated cursor-pointer transition-colors flex items-center justify-between ${
                  account.id === selectedAccountId ? 'bg-bg-surface' : ''
                }`}
                onClick={() => {
                  onSelectAccount(account.id);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div className="font-mono text-sm text-text-primary">{account.name}</div>
                  <div className="font-mono text-xs text-text-muted">
                    ${account.currentBalance?.toLocaleString() || 0}
                  </div>
                </div>
                {isAuthenticated && accounts.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(account.id);
                    }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-bg-card text-text-muted hover:text-loss transition-all"
                    title="Delete Account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Account */}
          <div className="p-4 border-t border-border">
            {isAuthenticated ? (
              !showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Account
                </button>
              ) : (
                <form onSubmit={handleAddAccount} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="input-luxe text-sm"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Starting Balance"
                    value={newAccountBalance}
                    onChange={(e) => setNewAccountBalance(e.target.value)}
                    className="input-luxe text-sm"
                    step="0.01"
                    min="0"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary flex-1 py-2"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewAccountName('');
                        setNewAccountBalance('');
                      }}
                      className="btn-secondary flex-1 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="space-y-3 text-center">
                <p className="font-mono text-xs text-text-muted">Sign in to manage accounts</p>
                <button
                  type="button"
                  onClick={handleRequireAuthentication}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AccountSelector;
