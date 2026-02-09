import React, { createContext, useContext } from 'react';
import { useAppState } from '../hooks/useAppState';

const AppStateContext = createContext(null);

/**
 * Provider component that wraps the app and provides account state to all screens.
 */
export const AppStateProvider = ({ children }) => {
  const appState = useAppState();
  
  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * Hook to access app state (accounts, selected account, etc.)
 * Must be used within AppStateProvider.
 */
export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within AppStateProvider');
  }
  return context;
};

export default AppStateContext;
