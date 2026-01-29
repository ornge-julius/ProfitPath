import { useState, useEffect, useCallback } from 'react';
import { useSupabase, useAuth } from '@profitpath/shared';
import { storageJson } from '../utils/storage';

const STORAGE_KEY = 'profitpath_selected_account';

/**
 * Mobile-specific app state hook that manages accounts and selected account.
 * Loads accounts from Supabase and persists selected account to AsyncStorage.
 */
export const useAppState = () => {
  const supabase = useSupabase();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load selected account from storage on mount
  useEffect(() => {
    const loadSelectedAccount = async () => {
      try {
        const stored = await storageJson.get(STORAGE_KEY);
        if (stored) {
          setSelectedAccountId(stored);
        }
      } catch (err) {
        console.error('Error loading selected account:', err);
      }
    };
    loadSelectedAccount();
  }, []);

  // Fetch accounts when authenticated
  useEffect(() => {
    if (!user?.id || authLoading) return;
    
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('accounts')
          .select('*')
          .eq('auth_user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (fetchError) {
          setError(fetchError.message);
          return;
        }
        
        if (data) {
          const mapped = data.map(acc => ({
            id: acc.id,
            name: acc.name,
            startingBalance: acc.starting_balance,
            currentBalance: acc.current_balance,
            createdAt: acc.created_at,
          }));
          setAccounts(mapped);
          
          // Auto-select first account if none selected or selected account no longer exists
          if (mapped.length > 0) {
            const currentExists = mapped.some(acc => acc.id === selectedAccountId);
            if (!selectedAccountId || !currentExists) {
              setSelectedAccountId(mapped[0].id);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, [user?.id, authLoading, supabase]);

  // Persist selected account to storage
  useEffect(() => {
    if (selectedAccountId) {
      storageJson.set(STORAGE_KEY, selectedAccountId).catch(() => {});
    }
  }, [selectedAccountId]);

  // Clear state when user logs out
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setAccounts([]);
      setSelectedAccountId(null);
      storageJson.set(STORAGE_KEY, null).catch(() => {});
    }
  }, [isAuthenticated, authLoading]);

  const selectAccount = useCallback((accountId) => {
    setSelectedAccountId(accountId);
  }, []);

  // Create a new account
  const createAccount = useCallback(async (name, startingBalance) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const { data, error: createError } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: user.id,
          name: name.trim(),
          starting_balance: parseFloat(startingBalance) || 0,
          current_balance: parseFloat(startingBalance) || 0,
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      const newAccount = {
        id: data.id,
        name: data.name,
        startingBalance: data.starting_balance,
        currentBalance: data.current_balance,
        createdAt: data.created_at,
      };
      
      setAccounts(prev => [newAccount, ...prev]);
      setSelectedAccountId(newAccount.id);
      
      return newAccount;
    } catch (err) {
      throw err;
    }
  }, [user?.id, supabase]);

  // Update an account
  const updateAccount = useCallback(async (accountId, updates) => {
    try {
      const updateData = {};
      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.startingBalance !== undefined) {
        updateData.starting_balance = parseFloat(updates.startingBalance) || 0;
      }
      
      const { data, error: updateError } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', accountId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? {
              ...acc,
              name: data.name,
              startingBalance: data.starting_balance,
              currentBalance: data.current_balance,
            }
          : acc
      ));
      
      return data;
    } catch (err) {
      throw err;
    }
  }, [supabase]);

  // Delete an account
  const deleteAccount = useCallback(async (accountId) => {
    try {
      const { error: deleteError } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      
      if (deleteError) throw deleteError;
      
      setAccounts(prev => {
        const updated = prev.filter(acc => acc.id !== accountId);
        
        // If we deleted the selected account, select another one
        if (selectedAccountId === accountId && updated.length > 0) {
          setSelectedAccountId(updated[0].id);
        } else if (updated.length === 0) {
          setSelectedAccountId(null);
        }
        
        return updated;
      });
      
      return true;
    } catch (err) {
      throw err;
    }
  }, [supabase, selectedAccountId]);

  // Refresh accounts from server
  const refreshAccounts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const mapped = data.map(acc => ({
          id: acc.id,
          name: acc.name,
          startingBalance: acc.starting_balance,
          currentBalance: acc.current_balance,
          createdAt: acc.created_at,
        }));
        setAccounts(mapped);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase]);

  // Get current account details
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return {
    // State
    accounts,
    selectedAccountId,
    selectedAccount,
    startingBalance: selectedAccount?.startingBalance ?? 0,
    isLoading: isLoading || authLoading,
    error,
    
    // Actions
    selectAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
  };
};
