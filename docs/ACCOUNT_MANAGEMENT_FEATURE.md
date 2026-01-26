# Account Management Feature Implementation

## Problem Statement

The application currently has several critical issues related to account management:

1. **Add Account Button Not Functional**: When users click the "Add New Account" button in the `AccountSelector` component, the form appears and can be filled out, but submitting the form doesn't actually persist the account to the database. The account is only added to local state with a temporary ID.

2. **Trades Cannot Be Added to New Accounts**: After adding a new account (even if it were persisted), users cannot add trades to that account because:
   - New accounts receive temporary IDs generated using `Date.now()` in the reducer
   - These temporary IDs don't exist in the database
   - The `useTradeManagement` hook requires a valid `account_id` that exists in the database to create trades

3. **Hardcoded Account ID Bug**: The application currently fetches accounts using a hardcoded account ID (`'f5bf8559-5779-47ce-ba65-75737aed3622'`) in `useAppState.js`. This means:
   - Only one specific account is ever loaded
   - The application doesn't fetch accounts specific to the authenticated user
   - Multiple users cannot have their own accounts
   - The TODO comments in the code explicitly indicate this needs to be fixed

## Current Architecture

### Account Creation Flow (Current - Broken)
1. User clicks "Add New Account" button in `AccountSelector`
2. Form appears with name and starting balance fields
3. User submits form → `handleAddAccount` in `AccountSelector` calls `onAddAccount` prop
4. `onAddAccount` prop is `handleAddAccount` from `App.jsx`
5. `handleAddAccount` calls `addAccount(accountData)` from `useAppState`
6. `addAccount` dispatches `ACCOUNTS_ACTIONS.ADD_ACCOUNT` to reducer
7. Reducer creates account with temporary ID (`Date.now()`) and adds to local state
8. **Problem**: Account is never saved to Supabase database

### Account Fetching Flow (Current - Broken)
1. `useAppState` hook initializes and runs `fetchAccount` effect
2. `fetchAccount` queries Supabase with hardcoded account ID
3. Only one account is ever loaded, regardless of user
4. **Problem**: Should fetch all accounts for the authenticated user

### Trade Creation Flow (Current - Broken for New Accounts)
1. User selects an account (or a newly created account)
2. User opens trade form and fills it out
3. User submits trade → `handleTradeSubmit` calls `addTrade` from `useTradeManagement`
4. `addTrade` uses `selectedAccountId` to create trade with `account_id: selectedAccountId`
5. **Problem**: If account was created locally with temporary ID, the database insert fails because the account doesn't exist

## Requirements

### 1. Fix Account Creation to Persist to Database

**Location**: `app/src/hooks/useAppState.js` - `addAccount` function

**Requirements**:
- Modify `addAccount` to be an async function that persists the account to Supabase
- Insert the account into the `accounts` table with proper fields:
  - `name`: Account name from form
  - `starting_balance`: Starting balance from form
  - `current_balance`: Should match starting balance initially
  - `user_id`: Should be set to the authenticated user's ID (from `useAuth` hook)
  - `is_active`: Should default to `true`
  - `created_at`: Will be automatically set by database
- Use Supabase's `insert` method to create the account
- Handle errors appropriately (show user feedback if needed)
- After successful database insert, update local state with the account data returned from Supabase (including the real UUID)
- The account should be automatically selected after creation

**Database Schema Reference**:
- Table: `accounts`
- Fields: `id` (UUID, auto-generated), `name` (text), `starting_balance` (numeric), `current_balance` (numeric), `user_id` (UUID, foreign key to auth.users), `is_active` (boolean), `created_at` (timestamp)

### 2. Fix Account Fetching to Load User's Accounts

**Location**: `app/src/hooks/useAppState.js` - `fetchAccount` function in `useEffect`

**Requirements**:
- Remove the hardcoded account ID (`'f5bf8559-5779-47ce-ba65-75737aed3622'`)
- Integrate with `useAuth` hook to get the authenticated user
- Query Supabase to fetch ALL accounts for the authenticated user:
  - Use `.eq('user_id', user.id)` to filter by user
  - Use `.select('*')` to get all account fields
  - Order by `created_at` descending (newest first) or `name` ascending
- Handle the case where user is not authenticated (should not fetch accounts or fetch empty array)
- Map all fetched accounts to the expected format (maintain backward compatibility with existing field mapping)
- Set all accounts in state using `SET_ACCOUNTS` action
- Automatically select the first account if one exists, or set `selectedAccountId` to `null` if no accounts exist
- The effect should re-run when the user authentication state changes

**Edge Cases**:
- User not authenticated: Should set empty accounts array
- User has no accounts: Should set empty accounts array and `selectedAccountId` to `null`
- User has multiple accounts: Should load all of them and allow selection
- User signs out: Should clear accounts from state
- User signs in: Should fetch their accounts

### 3. Fix Account Deletion to Persist to Database

**Location**: `app/src/hooks/useAppState.js` - `deleteAccount` function

**Requirements**:
- Modify `deleteAccount` to be an async function that deletes from Supabase
- Use Supabase's `delete` method to remove the account from the database
- Handle errors appropriately
- After successful deletion, update local state (current reducer logic handles this)
- Ensure that if the deleted account was selected, a new account is selected (reducer already handles this)

### 4. Fix Account Update to Persist to Database

**Location**: `app/src/hooks/useAppState.js` - `updateAccount` function

**Requirements**:
- Modify `updateAccount` to be an async function that updates Supabase
- Use Supabase's `update` method to modify the account in the database
- Map camelCase fields to snake_case for database (e.g., `startingBalance` → `starting_balance`)
- Handle errors appropriately
- After successful update, update local state with the updated account data

### 5. Ensure Trade Creation Works with All Accounts

**Location**: `app/src/hooks/useTradeManagement.js` - `addTrade` function

**Requirements**:
- Verify that `addTrade` correctly uses `selectedAccountId` (already implemented)
- Ensure that `selectedAccountId` is always a valid UUID from the database (not a temporary ID)
- The function should validate that `selectedAccountId` exists before attempting to create a trade
- Error handling should be clear if account doesn't exist

## Implementation Details

### Dependencies Needed

1. **Access to User Authentication**: The `useAppState` hook needs access to the authenticated user. This can be achieved by:
   - Importing and using the `useAuth` hook within `useAppState`
   - Or passing the user as a parameter (less preferred)
   - Recommended: Import `useAuth` hook

2. **Supabase Client**: Already imported and available

### Code Changes Required

#### File: `app/src/hooks/useAppState.js`

1. **Import `useAuth` hook**:
```javascript
import { useAuth } from './useAuth';
```

2. **Get user from `useAuth`**:
```javascript
const { user, isAuthenticated } = useAuth();
```

3. **Modify `fetchAccount` useEffect**:
   - Add `user` and `isAuthenticated` to dependency array
   - Change query to fetch all accounts for user
   - Handle unauthenticated state

4. **Modify `addAccount` function**:
   - Make it async
   - Add Supabase insert call
   - Include `user_id` in insert data
   - Update state with returned account data

5. **Modify `deleteAccount` function**:
   - Make it async
   - Add Supabase delete call
   - Handle errors

6. **Modify `updateAccount` function**:
   - Make it async
   - Add Supabase update call
   - Map field names correctly
   - Handle errors

#### File: `app/src/reducers/accountsReducer.js`

**No changes needed** - The reducer logic is correct for local state management. The issue is that the database operations are missing from the hook.

### Data Flow After Fix

#### Account Creation Flow (Fixed)
1. User fills out add account form
2. `handleAddAccount` → `addAccount(accountData)` in `useAppState`
3. `addAccount` inserts account into Supabase with `user_id`
4. Supabase returns created account with UUID
5. Reducer updates state with real account data
6. Account is automatically selected
7. User can now add trades to this account

#### Account Fetching Flow (Fixed)
1. User authenticates → `user` object available from `useAuth`
2. `useAppState` effect runs when `user` changes
3. Query Supabase: `SELECT * FROM accounts WHERE user_id = user.id`
4. All user's accounts loaded into state
5. First account automatically selected (or none if empty)

#### Trade Creation Flow (Fixed)
1. User selects an account (with valid UUID from database)
2. User creates trade
3. Trade is created with `account_id` = selected account's UUID
4. Trade successfully saved to database

## Testing Considerations

1. **Test Account Creation**:
   - Create account while authenticated
   - Verify account appears in database
   - Verify account appears in account selector
   - Verify account is automatically selected
   - Try creating account while not authenticated (should prompt sign-in)

2. **Test Account Fetching**:
   - Sign in as user with existing accounts
   - Verify all accounts load
   - Sign in as user with no accounts
   - Verify empty state
   - Sign out and verify accounts clear
   - Sign in as different user and verify only their accounts load

3. **Test Trade Creation with New Account**:
   - Create new account
   - Immediately try to add trade to that account
   - Verify trade is created successfully
   - Verify trade is associated with correct account

4. **Test Account Deletion**:
   - Delete account
   - Verify it's removed from database
   - Verify it's removed from UI
   - Verify another account is selected if available

5. **Test Multi-User Scenario**:
   - User A creates accounts
   - User B signs in
   - Verify User B only sees their own accounts
   - Verify User A's accounts are not visible to User B

## Database Considerations

### Row Level Security (RLS) Policies

Ensure that Supabase RLS policies are configured correctly:
- Users can only SELECT their own accounts (`user_id = auth.uid()`)
- Users can only INSERT accounts with their own `user_id`
- Users can only UPDATE their own accounts
- Users can only DELETE their own accounts

### Foreign Key Constraints

- `accounts.user_id` should reference `auth.users.id`
- `trades.account_id` should reference `accounts.id`
- Ensure cascade delete behavior is appropriate (or handle manually)

## Error Handling

All database operations should include proper error handling:
- Network errors
- Authentication errors
- Validation errors
- RLS policy violations
- Foreign key constraint violations

Consider showing user-friendly error messages when operations fail.

## Backward Compatibility

The existing code uses camelCase field names (`startingBalance`, `currentBalance`) while the database uses snake_case (`starting_balance`, `current_balance`). The mapping logic in `fetchAccount` should be maintained to ensure backward compatibility with existing components that expect camelCase.

## Future Improvements (Optional)

1. **Optimistic Updates**: Update UI immediately, then sync with database
2. **Offline Support**: Queue operations when offline, sync when online
3. **Account Validation**: Validate account names are unique per user
4. **Account Limits**: Enforce maximum number of accounts per user if needed
5. **Account Archiving**: Instead of deleting, mark accounts as inactive

