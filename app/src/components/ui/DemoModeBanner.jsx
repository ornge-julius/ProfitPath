import React from 'react';
import { useDemoMode } from '../../context/DemoModeContext';

const DemoModeBanner = ({ onSignIn }) => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 text-center"
      role="banner"
      aria-label="Demo mode indicator"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap max-w-7xl mx-auto">
        <span className="text-sm font-medium">
          You're viewing demo data. Sign in to track your own trades!
        </span>
        <button
          onClick={onSignIn}
          className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold 
                     hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          aria-label="Sign in to your account"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default DemoModeBanner;
