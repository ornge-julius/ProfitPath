// Action types
export const USERS_ACTIONS = {
  SET_USER_INFO: 'SET_USER_INFO',
  UPDATE_EMAIL: 'UPDATE_EMAIL',
  UPDATE_USERNAME: 'UPDATE_USERNAME',
  UPDATE_PASSWORD: 'UPDATE_PASSWORD',
  CLEAR_USER_INFO: 'CLEAR_USER_INFO'
};

// Initial state
export const initialUsersState = {
  email: '',
  username: '',
  password: '',
  isAuthenticated: false
};

// Users reducer
export const usersReducer = (state, action) => {
  switch (action.type) {
    case USERS_ACTIONS.SET_USER_INFO:
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true
      };
    
    case USERS_ACTIONS.UPDATE_EMAIL:
      return {
        ...state,
        email: action.payload
      };
    
    case USERS_ACTIONS.UPDATE_USERNAME:
      return {
        ...state,
        username: action.payload
      };
    
    case USERS_ACTIONS.UPDATE_PASSWORD:
      return {
        ...state,
        password: action.payload
      };
    
    case USERS_ACTIONS.CLEAR_USER_INFO:
      return {
        ...initialUsersState
      };
    
    default:
      return state;
  }
};
