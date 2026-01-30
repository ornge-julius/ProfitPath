// Action types
export const ACCOUNTS_ACTIONS = {
  UPDATE_STARTING_BALANCE: 'UPDATE_STARTING_BALANCE',
  UPDATE_CURRENT_BALANCE: 'UPDATE_CURRENT_BALANCE',
  SET_USER_ID: 'SET_USER_ID',
  TOGGLE_BALANCE_FORM: 'TOGGLE_BALANCE_FORM',
  TOGGLE_TRADE_FORM: 'TOGGLE_TRADE_FORM',
  ADD_ACCOUNT: 'ADD_ACCOUNT',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  SET_SELECTED_ACCOUNT: 'SET_SELECTED_ACCOUNT',
  SET_ACCOUNTS: 'SET_ACCOUNTS'
};

// Initial state
export const initialAccountsState = {
  accounts: [],
  selectedAccountId: null,
  showBalanceForm: false,
  showTradeForm: false
};

// Accounts reducer
export const accountsReducer = (state, action) => {
  switch (action.type) {
    case ACCOUNTS_ACTIONS.ADD_ACCOUNT:
      // Preserve ID if provided (from database), otherwise generate temporary ID
      const newAccount = {
        ...action.payload,
        id: action.payload.id || Date.now(),
        created_at: action.payload.created_at || new Date().toISOString(),
        isActive: action.payload.isActive !== undefined ? action.payload.isActive : true
      };
      return {
        ...state,
        accounts: [...state.accounts, newAccount],
        selectedAccountId: newAccount.id
      };
    
    case ACCOUNTS_ACTIONS.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(account => 
          account.id === action.payload.id ? action.payload : account
        )
      };
    
    case ACCOUNTS_ACTIONS.DELETE_ACCOUNT: {
      const remainingAccounts = state.accounts.filter(account => account.id !== action.payload);
      let newSelectedId = state.selectedAccountId;
      
      // If we're deleting the selected account, switch to the first remaining account
      if (action.payload === state.selectedAccountId && remainingAccounts.length > 0) {
        newSelectedId = remainingAccounts[0].id;
      }
      
      return {
        ...state,
        accounts: remainingAccounts,
        selectedAccountId: newSelectedId
      };
    }
    
    case ACCOUNTS_ACTIONS.SET_SELECTED_ACCOUNT:
      return {
        ...state,
        selectedAccountId: action.payload
      };
    
    case ACCOUNTS_ACTIONS.SET_ACCOUNTS: {
      const newAccounts = action.payload;
      let newSelectedId = state.selectedAccountId;
      
      // If no account is currently selected, or the selected account doesn't exist in the new list,
      // automatically select the first account if available
      if (newAccounts.length > 0) {
        const selectedAccountExists = newAccounts.some(acc => acc.id === newSelectedId);
        if (!selectedAccountExists || !newSelectedId) {
          newSelectedId = newAccounts[0].id;
        }
      } else {
        // No accounts available, clear selection
        newSelectedId = null;
      }
      
      return {
        ...state,
        accounts: newAccounts,
        selectedAccountId: newSelectedId
      };
    }
    
    case ACCOUNTS_ACTIONS.UPDATE_STARTING_BALANCE:
      return {
        ...state,
        accounts: state.accounts.map(account => 
          account.id === state.selectedAccountId 
            ? { ...account, startingBalance: action.payload, currentBalance: action.payload }
            : account
        )
      };
    
    case ACCOUNTS_ACTIONS.UPDATE_CURRENT_BALANCE:
      return {
        ...state,
        accounts: state.accounts.map(account => 
          account.id === state.selectedAccountId 
            ? { ...account, currentBalance: action.payload }
            : account
        )
      };
    
    case ACCOUNTS_ACTIONS.SET_USER_ID:
      return {
        ...state,
        accounts: state.accounts.map(account => ({ ...account, user_id: action.payload }))
      };
    
    case ACCOUNTS_ACTIONS.TOGGLE_BALANCE_FORM:
      return {
        ...state,
        showBalanceForm: !state.showBalanceForm
      };
    
    case ACCOUNTS_ACTIONS.TOGGLE_TRADE_FORM:
      return {
        ...state,
        showTradeForm: !state.showTradeForm
      };
    
    default:
      return state;
  }
};
