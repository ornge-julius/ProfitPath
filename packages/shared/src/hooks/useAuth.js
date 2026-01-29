import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../supabase/SupabaseContext';

/**
 * Authentication hook that uses Supabase via context injection.
 * Works with both web and mobile apps.
 */
export const useAuth = () => {
  const supabase = useSupabase();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Error handling
        } else if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Error handling
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email, password) => {
    // #region agent log
    console.log('[DEBUG useAuth] signInWithEmail called, supabase exists:', !!supabase, 'auth exists:', !!supabase?.auth);
    // #endregion
    try {
      setIsLoading(true);
      // #region agent log
      console.log('[DEBUG useAuth] Calling supabase.auth.signInWithPassword...');
      // #endregion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      // #region agent log
      console.log('[DEBUG useAuth] Supabase returned - hasData:', !!data, 'hasError:', !!error, 'errorMsg:', error?.message);
      // #endregion

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return data.user;
      }
    } catch (err) {
      // #region agent log
      console.log('[DEBUG useAuth] EXCEPTION:', err.message, err.name);
      // #endregion
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Sign up with email and password
  const signUpWithEmail = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  return {
    user,
    isAuthenticated,
    isLoading,
    signInWithEmail,
    signOut,
    signUpWithEmail
  };
};
