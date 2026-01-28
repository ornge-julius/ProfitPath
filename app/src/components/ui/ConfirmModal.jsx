import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor = 'bg-loss hover:bg-loss/80'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-overlay z-40"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="modal-content max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-loss-bg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-loss" />
              </div>
              <h3 className="font-display text-xl text-text-primary">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className="font-mono text-sm text-text-secondary mb-6 leading-relaxed">
              {message}
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-3 ${confirmButtonColor} rounded-lg font-mono text-sm font-medium text-text-primary transition-all`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
