import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AccountEditForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  account 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    startingBalance: '',
    currentBalance: ''
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        startingBalance: account.startingBalance || '',
        currentBalance: account.currentBalance || ''
      });
    }
  }, [account]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.startingBalance && formData.currentBalance) {
      onSubmit({
        ...account,
        name: formData.name.trim(),
        startingBalance: parseFloat(formData.startingBalance),
        currentBalance: parseFloat(formData.currentBalance)
      });
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="modal-content w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display text-xl text-text-primary">Edit Account</h2>
            <p className="font-mono text-xs text-text-muted mt-1">Update account details</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="name" className="label-luxe">
              Account Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-luxe"
              placeholder="Enter account name"
              required
            />
          </div>

          <div>
            <label htmlFor="startingBalance" className="label-luxe">
              Starting Balance
            </label>
            <input
              type="number"
              id="startingBalance"
              name="startingBalance"
              value={formData.startingBalance}
              onChange={handleChange}
              className="input-luxe"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label htmlFor="currentBalance" className="label-luxe">
              Current Balance
            </label>
            <input
              type="number"
              id="currentBalance"
              name="currentBalance"
              value={formData.currentBalance}
              onChange={handleChange}
              className="input-luxe"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEditForm;
