import { useReducer, useCallback, useEffect } from 'react';
import { accountsReducer, ACCOUNTS_ACTIONS, initialAccountsState } from '../reducers/accountsReducer';
import { usersReducer, USERS_ACTIONS, initialUsersState } from '../reducers/usersReducer';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';

export const useAppState = () => {
  const { user, isAuthenticated } = useAuth();
  const [accountsState, accountsDispatch] = useReducer(accountsReducer, initialAccountsState);
  const [usersState, usersDispatch] = useReducer(usersReducer, initialUsersState);

  useEffect(() => {
    const fetchAccounts = async () => {
      // Don't fetch if user is not authenticated
      if (!isAuthenticated || !user) {
        accountsDispatch({
          type: ACCOUNTS_ACTIONS.SET_ACCOUNTS,
          payload: []
        });
        accountsDispatch({
          type: ACCOUNTS_ACTIONS.SET_SELECTED_ACCOUNT,
          payload: null
        });
        return;
      }

      try {
        // Fetch all accounts for the authenticated user
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (accountsError) {
          console.error('Error fetching accounts:', accountsError);
          return;
        }

        if (!accountsData || accountsData.length === 0) {
          // No accounts found, set empty array
          accountsDispatch({
            type: ACCOUNTS_ACTIONS.SET_ACCOUNTS,
            payload: []
          });
          accountsDispatch({
            type: ACCOUNTS_ACTIONS.SET_SELECTED_ACCOUNT,
            payload: null
          });
          return;
        }

        // Map database fields to expected format (maintaining backward compatibility)
        const mappedAccounts = accountsData.map(accountData => ({
          id: accountData.id,
          name: accountData.name || 'Trading Account',
          startingBalance: accountData.starting_balance || 0,
          currentBalance: accountData.current_balance || accountData.starting_balance || 0,
          user_id: accountData.user_id || null,
          created_at: accountData.created_at || new Date().toISOString(),
          isActive: accountData.is_active !== false
        }));

        // Set all accounts in state
        accountsDispatch({
          type: ACCOUNTS_ACTIONS.SET_ACCOUNTS,
          payload: mappedAccounts
        });

        // Automatically select the first account if one exists
        if (mappedAccounts.length > 0) {
          accountsDispatch({
            type: ACCOUNTS_ACTIONS.SET_SELECTED_ACCOUNT,
            payload: mappedAccounts[0].id
          });
        } else {
          accountsDispatch({
            type: ACCOUNTS_ACTIONS.SET_SELECTED_ACCOUNT,
            payload: null
          });
        }

      } catch (err) {
        console.error('Error in fetchAccounts:', err);
      }
    };

    fetchAccounts();
  }, [user, isAuthenticated]);

  // Account-related functions (maintaining the same API as useSettings)
  const updateStartingBalance = useCallback(async (newBalance) => {
    const balance = parseFloat(newBalance);
    
    if (!accountsState.selectedAccountId) {
      return;
    }
    
    // Store the previous balance for potential rollback
    const previousBalance = accountsState.accounts.find(acc => acc.id === accountsState.selectedAccountId)?.startingBalance || 0;
    
    // Optimistically update local state
    accountsDispatch({ type: ACCOUNTS_ACTIONS.UPDATE_STARTING_BALANCE, payload: balance });

    try {
      const { error } = await supabase
        .from('accounts')
        .upsert({ 
          id: accountsState.selectedAccountId, 
          starting_balance: balance 
        });

      // Handle database errors
      if (error) {
        // Rollback the optimistic update
        accountsDispatch({ type: ACCOUNTS_ACTIONS.UPDATE_STARTING_BALANCE, payload: previousBalance });
        return;
      }
    } catch (err) {
      // Rollback the optimistic update
      accountsDispatch({ type: ACCOUNTS_ACTIONS.UPDATE_STARTING_BALANCE, payload: previousBalance });
    }
  }, [accountsState.selectedAccountId, accountsState.accounts]);

  const toggleBalanceForm = useCallback(() => {
    accountsDispatch({ type: ACCOUNTS_ACTIONS.TOGGLE_BALANCE_FORM });
  }, []);

  const toggleTradeForm = useCallback(() => {
    accountsDispatch({ type: ACCOUNTS_ACTIONS.TOGGLE_TRADE_FORM });
  }, []);

  // New account management functions
  const addAccount = useCallback(async (accountData) => {
    // Don't allow adding accounts if user is not authenticated
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to add accounts');
    }

    try {
      // Insert account into Supabase database
      const { data: insertedAccount, error } = await supabase
        .from('accounts')
        .insert([
          {
            name: accountData.name,
            starting_balance: accountData.startingBalance,
            current_balance: accountData.currentBalance || accountData.startingBalance,
            user_id: user.id,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating account:', error);
        throw error;
      }

      // Map database fields to expected format
      const mappedAccount = {
        id: insertedAccount.id,
        name: insertedAccount.name || accountData.name,
        startingBalance: insertedAccount.starting_balance || accountData.startingBalance,
        currentBalance: insertedAccount.current_balance || accountData.currentBalance || accountData.startingBalance,
        user_id: insertedAccount.user_id || user.id,
        created_at: insertedAccount.created_at || new Date().toISOString(),
        isActive: insertedAccount.is_active !== false
      };

      // Update local state with the account data from database (including real UUID)
      accountsDispatch({ type: ACCOUNTS_ACTIONS.ADD_ACCOUNT, payload: mappedAccount });

      // Account is automatically selected by the reducer
      return mappedAccount;
    } catch (err) {
      console.error('Error in addAccount:', err);
      throw err;
    }
  }, [user, isAuthenticated]);

  const updateAccount = useCallback(async (accountData) => {
    // Don't allow updating accounts if user is not authenticated
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to update accounts');
    }

    if (!accountData.id) {
      throw new Error('Account ID is required for update');
    }

    try {
      // Update account in Supabase database
      // Map camelCase to snake_case for database
      const { data: updatedAccount, error } = await supabase
        .from('accounts')
        .update({
          name: accountData.name,
          starting_balance: accountData.startingBalance,
          current_balance: accountData.currentBalance
        })
        .eq('id', accountData.id)
        .eq('user_id', user.id) // Ensure user can only update their own accounts
        .select()
        .single();

      if (error) {
        console.error('Error updating account:', error);
        throw error;
      }

      // Map database fields to expected format
      const mappedAccount = {
        id: updatedAccount.id,
        name: updatedAccount.name || accountData.name,
        startingBalance: updatedAccount.starting_balance || accountData.startingBalance,
        currentBalance: updatedAccount.current_balance || accountData.currentBalance,
        user_id: updatedAccount.user_id || user.id,
        created_at: updatedAccount.created_at || accountData.created_at,
        isActive: updatedAccount.is_active !== false
      };

      // Update local state with the updated account data
      accountsDispatch({ type: ACCOUNTS_ACTIONS.UPDATE_ACCOUNT, payload: mappedAccount });

      return mappedAccount;
    } catch (err) {
      console.error('Error in updateAccount:', err);
      throw err;
    }
  }, [user, isAuthenticated]);

  const deleteAccount = useCallback(async (accountId) => {
    // Don't allow deleting accounts if user is not authenticated
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to delete accounts');
    }

    if (!accountId) {
      throw new Error('Account ID is required for deletion');
    }

    try {
      // Delete account from Supabase database
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id); // Ensure user can only delete their own accounts

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      // Update local state (reducer handles selecting another account if needed)
      accountsDispatch({ type: ACCOUNTS_ACTIONS.DELETE_ACCOUNT, payload: accountId });
    } catch (err) {
      console.error('Error in deleteAccount:', err);
      throw err;
    }
  }, [user, isAuthenticated]);

  const selectAccount = useCallback((accountId) => {
    accountsDispatch({ type: ACCOUNTS_ACTIONS.SET_SELECTED_ACCOUNT, payload: accountId });
  }, []);

  const setAccounts = useCallback((accounts) => {
    accountsDispatch({ type: ACCOUNTS_ACTIONS.SET_ACCOUNTS, payload: accounts });
  }, []);

  // User-related functions
  const setUserInfo = useCallback((userInfo) => {
    usersDispatch({ type: USERS_ACTIONS.SET_USER_INFO, payload: userInfo });
  }, []);

  const updateEmail = useCallback((email) => {
    usersDispatch({ type: USERS_ACTIONS.UPDATE_EMAIL, payload: email });
  }, []);

  const updateUsername = useCallback((username) => {
    usersDispatch({ type: USERS_ACTIONS.UPDATE_USERNAME, payload: username });
  }, []);

  const updatePassword = useCallback((password) => {
    usersDispatch({ type: USERS_ACTIONS.UPDATE_PASSWORD, payload: password });
  }, []);

  const clearUserInfo = useCallback(() => {
    usersDispatch({ type: USERS_ACTIONS.CLEAR_USER_INFO });
  }, []);

  // Get selected account data
  const selectedAccount = accountsState.accounts.find(acc => acc.id === accountsState.selectedAccountId);

  // Return the same API as useSettings for backward compatibility
  return {
    // Account state (maintaining exact same API)
    startingBalance: selectedAccount?.startingBalance || 0,
    showBalanceForm: accountsState.showBalanceForm,
    showTradeForm: accountsState.showTradeForm,
    updateStartingBalance,
    toggleBalanceForm,
    toggleTradeForm,
    
    // Additional account state
    currentBalance: selectedAccount?.currentBalance || 0,
    user_id: selectedAccount?.user_id || null,
    
    // New account management state and functions
    accounts: accountsState.accounts,
    selectedAccountId: accountsState.selectedAccountId,
    selectedAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    selectAccount,
    setAccounts,
    
    // User state
    email: usersState.email,
    username: usersState.username,
    password: usersState.password,
    isAuthenticated: usersState.isAuthenticated,
    setUserInfo,
    updateEmail,
    updateUsername,
    updatePassword,
    clearUserInfo
  };
};
