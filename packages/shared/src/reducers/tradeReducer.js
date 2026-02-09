// Action types
export const TRADE_ACTIONS = {
  ADD_TRADE: 'ADD_TRADE',
  UPDATE_TRADE: 'UPDATE_TRADE',
  DELETE_TRADE: 'DELETE_TRADE',
  SET_TRADES: 'SET_TRADES',
  SET_EDITING_TRADE: 'SET_EDITING_TRADE',
  CLEAR_EDITING_TRADE: 'CLEAR_EDITING_TRADE',
  SET_ACCOUNT_TRADES: 'SET_ACCOUNT_TRADES'
};

// Initial state
export const initialTradeState = {
  trades: [],
  editingTrade: null
};

// Trade reducer
export const tradeReducer = (state, action) => {
  switch (action.type) {
    case TRADE_ACTIONS.ADD_TRADE:
      return {
        ...state,
        trades: [...state.trades, action.payload]
      };
    
    case TRADE_ACTIONS.UPDATE_TRADE:
      return {
        ...state,
        trades: state.trades.map(trade => 
          trade.id === action.payload.id ? action.payload : trade
        )
      };
    
    case TRADE_ACTIONS.DELETE_TRADE:
      return {
        ...state,
        trades: state.trades.filter(trade => trade.id !== action.payload)
      };
    
    case TRADE_ACTIONS.SET_TRADES:
      return {
        ...state,
        trades: action.payload
      };
    
    case TRADE_ACTIONS.SET_ACCOUNT_TRADES:
      return {
        ...state,
        trades: action.payload
      };
    
    case TRADE_ACTIONS.SET_EDITING_TRADE:
      return {
        ...state,
        editingTrade: action.payload
      };

    case TRADE_ACTIONS.CLEAR_EDITING_TRADE:
      return {
        ...state,
        editingTrade: null
      };

    default:
      return state;
  }
};
