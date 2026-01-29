import { createContext, useContext, createElement } from 'react';

const SupabaseContext = createContext(null);

/**
 * Provider component that wraps app and makes Supabase client available to all children.
 * Each app (web, mobile) initializes its own Supabase client and passes it here.
 * 
 * @param {Object} props
 * @param {Object} props.client - Supabase client instance
 * @param {React.ReactNode} props.children - Child components
 */
export const SupabaseProvider = ({ client, children }) => {
  return createElement(SupabaseContext.Provider, { value: client }, children);
};

/**
 * Hook to access the Supabase client from context.
 * Must be used within a SupabaseProvider.
 * 
 * @returns {Object} Supabase client instance
 * @throws {Error} If used outside of SupabaseProvider
 */
export const useSupabase = () => {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return client;
};
