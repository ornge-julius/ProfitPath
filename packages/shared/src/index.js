// Supabase Context
export { SupabaseProvider, useSupabase } from './supabase/SupabaseContext';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useTradeManagement } from './hooks/useTradeManagement';

// Reducers
export { 
  accountsReducer, 
  ACCOUNTS_ACTIONS, 
  initialAccountsState 
} from './reducers/accountsReducer';

export { 
  tradeReducer, 
  TRADE_ACTIONS, 
  initialTradeState 
} from './reducers/tradeReducer';

export { 
  usersReducer, 
  USERS_ACTIONS, 
  initialUsersState 
} from './reducers/usersReducer';

// Utilities
export {
  normalizeDate,
  calculateProfit,
  calculateBalanceAtDate,
  calculateMetrics,
  formatDate,
  formatDateForTooltip,
  formatDateForInput,
  generateCumulativeProfitData,
  generateAccountBalanceData,
  generateLast30DaysNetPNLData,
  generateBalanceTrendData,
  generateWinLossData,
  calculateTradeDuration,
  calculateReturnPercentage,
  getResultText,
  getResultNumber,
  isWin,
  isLoss,
  getTradeTypeText,
  getTradeTypeNumber,
  isCall,
  isPut,
  generateMonthlyNetPNLData,
  calculateTradeBatches,
  generateWinLossChartData,
  generateBatchComparisonData
} from './utils/calculations';
