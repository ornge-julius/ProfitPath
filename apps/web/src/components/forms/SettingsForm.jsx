import React, { useState } from 'react';
import { X } from 'lucide-react';

const SettingsForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentBalance 
}) => {
  const [balance, setBalance] = useState(currentBalance);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(balance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="modal-content w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display text-xl text-text-primary">Account Settings</h2>
            <p className="font-mono text-xs text-text-muted mt-1">Update your account balance</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="label-luxe">Starting Account Balance</label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="50000"
              className="input-luxe"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsForm;
