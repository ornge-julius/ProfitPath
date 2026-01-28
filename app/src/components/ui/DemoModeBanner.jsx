import React from 'react';
import { useDemoMode } from '../../context/DemoModeContext';
import { Eye } from 'lucide-react';

const DemoModeBanner = ({ onSignIn }) => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-bg-surface border-b border-border"
      role="banner"
      aria-label="Demo mode indicator"
    >
      <div className="flex items-center justify-center gap-4 px-4 py-2.5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gold" />
          <span className="font-mono text-xs text-text-secondary">
            Viewing demo data
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <button
          onClick={onSignIn}
          className="font-mono text-xs text-gold hover:text-gold-light transition-colors"
          aria-label="Sign in to your account"
        >
          Sign in to track your trades →
        </button>
      </div>
    </div>
  );
};

export default DemoModeBanner;
