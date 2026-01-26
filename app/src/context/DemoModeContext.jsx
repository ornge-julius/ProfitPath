import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

const DemoModeContext = createContext({
  isDemoMode: false,
  demoUserId: null,
  demoAuthUserId: null,
});

export const DemoModeProvider = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  const value = useMemo(() => {
    const demoUserId = process.env.REACT_APP_DEMO_USER_ID || null;
    const demoAuthUserId = process.env.REACT_APP_DEMO_AUTH_USER_ID || null;
    
    // Only enable demo mode when:
    // 1. Auth has finished loading
    // 2. User is not authenticated
    // 3. Demo user environment variables are configured
    const isDemoMode = !isLoading && !isAuthenticated && !!demoUserId && !!demoAuthUserId;
    
    return {
      isDemoMode,
      demoUserId,
      demoAuthUserId,
    };
  }, [isAuthenticated, isLoading]);

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoModeContext);
