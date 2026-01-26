# Demo View Mode

## Overview

This feature enables a demo view mode for the ProfitPath application that displays performance metrics and trading data from a pre-configured demo user when no user is logged in. This allows potential users to explore the application's full functionality and see real trading metrics without needing to create an account first, serving as an effective showcase of the platform's capabilities.

## Problem Statement

Currently, when users visit the application without being logged in, they see empty states or loading indicators with no meaningful content to explore. This creates a poor first impression and makes it difficult for potential users to understand the value proposition of the application. Users must sign up and enter their own trading data before they can see how the dashboard, charts, and metrics work.

By implementing a demo view mode, visitors can immediately see a fully populated dashboard with real trading data, understand the application's features, and make an informed decision about signing up.

## Requirements

### Functional Requirements

1. **Demo User Configuration**: The application must support configuring a demo user via environment variables:
   - `REACT_APP_DEMO_USER_ID` - The user_id from the users/accounts table (UUID: `7c2bb6e3-c000-4c1d-8402-d83c96bfadd0`)
   - `REACT_APP_DEMO_AUTH_USER_ID` - The auth_user_id for Supabase auth (UUID: `8d0006d6-2ca5-4f58-adab-2571cb2a14ff`)

2. **Automatic Demo Mode**: When no user is authenticated, the application must automatically load and display the demo user's data including:
   - All accounts belonging to the demo user
   - All trades for the demo user's accounts
   - All calculated metrics (win rate, net profit, current balance, etc.)
   - All charts (cumulative profit, monthly P&L, last 30 days)

3. **Read-Only Demo Mode**: While in demo mode:
   - Users can view all data and navigate all views (Dashboard, History, Comparison, Tags)
   - Users cannot add, edit, or delete trades
   - Users cannot add, edit, or delete accounts
   - Users cannot modify settings (starting balance)
   - Attempting write operations should prompt the sign-in modal

4. **Demo Mode Indicator**: Display a visual indicator that the user is viewing demo data, with a call-to-action to sign up or sign in.

5. **Seamless Transition**: When a user logs in from demo mode:
   - Demo data should be immediately replaced with the authenticated user's data
   - All state should properly reset and reload

6. **Demo Data Isolation**: Demo user's data must be read-only at the database/RLS level to prevent accidental modification.

### Non-Functional Requirements

1. **Performance**: Demo data should load as quickly as regular user data with no additional latency.

2. **Security**: 
   - Demo user credentials must never be exposed to the client
   - Environment variables must not contain sensitive authentication tokens
   - RLS policies should protect demo data from modification

3. **Responsiveness**: Demo mode must work identically across all viewport sizes (mobile, tablet, desktop).

4. **Accessibility**: Demo mode indicator and CTA must be accessible (proper contrast, screen reader compatible).

5. **Maintainability**: Demo user configuration should be easy to change without code modifications.

## Technical Implementation

### Recommended Approach

The implementation involves modifying the authentication and data-fetching hooks to detect unauthenticated state and load demo data instead.

#### 1. Environment Variables Setup

Add to `app/.env.local`:

```bash
# Demo User Configuration
REACT_APP_DEMO_USER_ID=7c2bb6e3-c000-4c1d-8402-d83c96bfadd0
REACT_APP_DEMO_AUTH_USER_ID=8d0006d6-2ca5-4f58-adab-2571cb2a14ff
```

#### 2. Create Demo Mode Context

Create a new context to manage demo mode state and provide it throughout the app.

```jsx
// src/context/DemoModeContext.jsx
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
    // Only enable demo mode when auth has finished loading and user is not authenticated
    const isDemoMode = !isLoading && !isAuthenticated;
    
    return {
      isDemoMode,
      demoUserId: process.env.REACT_APP_DEMO_USER_ID || null,
      demoAuthUserId: process.env.REACT_APP_DEMO_AUTH_USER_ID || null,
    };
  }, [isAuthenticated, isLoading]);

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoModeContext);
```

#### 3. Modify useAppState Hook

Update `useAppState.js` to fetch demo accounts when in demo mode:

```jsx
// In useAppState.js - modify the fetchAccounts useEffect
import { useDemoMode } from '../context/DemoModeContext';

export const useAppState = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isDemoMode, demoAuthUserId } = useDemoMode();
  
  // ... existing state setup ...

  useEffect(() => {
    if (authLoading) return;

    const fetchAccounts = async () => {
      // Determine which user ID to use for fetching accounts
      const targetAuthUserId = isAuthenticated && user?.id 
        ? user.id 
        : isDemoMode && demoAuthUserId 
          ? demoAuthUserId 
          : null;

      if (!targetAuthUserId) {
        accountsDispatch({ type: ACCOUNTS_ACTIONS.SET_ACCOUNTS, payload: [] });
        return;
      }

      try {
        const { data: accountsData, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('auth_user_id', targetAuthUserId)
          .order('created_at', { ascending: false });

        // ... rest of existing logic ...
      } catch (err) {
        // Error handling
      }
    };

    fetchAccounts();
  }, [user?.id, isAuthenticated, authLoading, isDemoMode, demoAuthUserId]);

  // ... rest of hook ...
};
```

#### 4. Create Demo Mode Banner Component

```jsx
// src/components/ui/DemoModeBanner.jsx
import React from 'react';
import { useDemoMode } from '../../context/DemoModeContext';

const DemoModeBanner = ({ onSignIn }) => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span className="text-sm font-medium">
          👋 You're viewing demo data. Sign in to track your own trades!
        </span>
        <button
          onClick={onSignIn}
          className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold 
                     hover:bg-blue-50 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default DemoModeBanner;
```

#### 5. Modify Write Operations

Update all write operations to check for demo mode and prompt sign-in:

```jsx
// In App.jsx - modify ensureAuthenticated
const ensureAuthenticated = () => {
  if (!isAuthenticated) {
    setShowSignInForm(true);
    return false;
  }
  return true;
};

// This pattern is already used - ensure it's applied to all write operations
```

### File Structure

- `src/context/DemoModeContext.jsx` - New demo mode context provider
- `src/components/ui/DemoModeBanner.jsx` - New demo mode banner component
- `src/hooks/useAppState.js` - Modified to support demo user data fetching
- `src/hooks/useTradeManagement.js` - Modified to support demo user data fetching
- `src/App.jsx` - Add DemoModeProvider and DemoModeBanner
- `app/.env.local` - Add demo user environment variables

### Dependencies

No new dependencies required. Uses existing:
- React Context API
- Supabase client
- Existing authentication hooks

## Acceptance Criteria

### Scenario 1: Viewing Demo Data When Not Logged In
- **Given** the user is not logged in
- **And** demo user environment variables are configured
- **When** the user visits the application
- **Then** the demo user's accounts should be loaded
- **And** the demo user's trades should be displayed
- **And** all metrics and charts should show demo data
- **And** a demo mode banner should be visible

### Scenario 2: Demo Mode Banner Display
- **Given** the user is viewing in demo mode
- **When** the dashboard loads
- **Then** a banner should display indicating demo mode
- **And** the banner should include a "Sign In" call-to-action
- **And** clicking "Sign In" should open the sign-in modal

### Scenario 3: Attempting Write Operations in Demo Mode
- **Given** the user is in demo mode
- **When** the user attempts to add a trade
- **Then** the sign-in modal should open
- **And** no trade should be created

### Scenario 4: Attempting Edit Operations in Demo Mode
- **Given** the user is in demo mode
- **When** the user attempts to edit a trade
- **Then** the sign-in modal should open
- **And** no changes should be saved

### Scenario 5: Attempting Delete Operations in Demo Mode
- **Given** the user is in demo mode
- **When** the user attempts to delete a trade
- **Then** the sign-in modal should open
- **And** no trade should be deleted

### Scenario 6: Attempting Account Operations in Demo Mode
- **Given** the user is in demo mode
- **When** the user attempts to add, edit, or delete an account
- **Then** the sign-in modal should open
- **And** no account changes should occur

### Scenario 7: Transitioning from Demo to Authenticated Mode
- **Given** the user is viewing demo data
- **When** the user successfully logs in
- **Then** the demo data should be replaced with the user's data
- **And** the demo mode banner should disappear
- **And** write operations should be enabled

### Scenario 8: Navigating Views in Demo Mode
- **Given** the user is in demo mode
- **When** the user navigates between Dashboard, History, Comparison, and Tags views
- **Then** all views should display demo data correctly
- **And** navigation should work without errors

### Scenario 9: Demo Mode with Missing Environment Variables
- **Given** demo environment variables are not configured
- **When** an unauthenticated user visits the application
- **Then** the application should show the standard empty/login state
- **And** no errors should occur

### Scenario 10: Account Selection in Demo Mode
- **Given** the user is in demo mode
- **And** the demo user has multiple accounts
- **When** the user switches between accounts
- **Then** the correct trades and metrics for each account should display

## Edge Cases

1. **Missing Environment Variables**: If `REACT_APP_DEMO_USER_ID` or `REACT_APP_DEMO_AUTH_USER_ID` are not set, the app should gracefully fall back to showing the standard unauthenticated state (empty dashboard, login prompt).

2. **Demo User Has No Data**: If the demo user exists but has no accounts or trades, display appropriate empty states rather than errors.

3. **Invalid Demo User IDs**: If the environment variables contain invalid UUIDs, handle the Supabase error gracefully and fall back to standard unauthenticated behavior.

4. **Race Conditions on Login**: When transitioning from demo to authenticated mode, ensure data doesn't briefly show a mix of demo and user data.

5. **Demo User Account Deletion**: If someone accidentally deletes demo accounts in the database, the app should handle the empty state gracefully.

6. **Concurrent Sessions**: If a user has demo mode open in one tab and logs in on another, the demo tab should detect the auth state change and refresh.

7. **Deep Linking in Demo Mode**: If a user deep-links to a specific trade detail page (`/detail/:tradeId`) while in demo mode, the trade should display if it belongs to the demo user.

8. **Tag Context in Demo Mode**: The TagProvider and TagFilterProvider should work correctly with demo user's tags.

9. **LocalStorage Account Selection**: When switching from demo to authenticated mode, the `selectedAccountId` in localStorage should be cleared or updated appropriately.

10. **Mobile Navigation in Demo Mode**: The bottom navigation dock should work correctly in demo mode, with write operations still prompting sign-in.

## Testing Checklist

- [ ] Demo mode activates when not logged in and env vars are set
- [ ] Demo data loads for accounts, trades, and metrics
- [ ] Demo mode banner displays correctly
- [ ] "Sign In" button in banner opens sign-in modal
- [ ] Add trade prompts sign-in in demo mode
- [ ] Edit trade prompts sign-in in demo mode
- [ ] Delete trade prompts sign-in in demo mode
- [ ] Add account prompts sign-in in demo mode
- [ ] Edit account prompts sign-in in demo mode
- [ ] Delete account prompts sign-in in demo mode
- [ ] Settings changes prompt sign-in in demo mode
- [ ] Dashboard view displays demo data correctly
- [ ] Trade History view displays demo data correctly
- [ ] Batch Comparison view displays demo data correctly
- [ ] Tags Management view displays demo data correctly
- [ ] Trade Detail page works in demo mode
- [ ] Account switching works in demo mode
- [ ] Date filtering works with demo data
- [ ] Tag filtering works with demo data
- [ ] Charts render correctly with demo data
- [ ] Logging in transitions from demo to user data
- [ ] Logging out transitions from user to demo data
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices (iOS Safari, Chrome Android)
- [ ] Demo banner is responsive on all viewports
- [ ] Keyboard navigation works in demo mode
- [ ] Screen reader announces demo mode correctly
- [ ] App gracefully handles missing env vars
- [ ] App gracefully handles invalid demo user IDs

## Related Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Create React App Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
