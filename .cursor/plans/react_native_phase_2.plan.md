---
name: React Native iOS App - Phase 2
overview: Complete the mobile app with authentication, account management, charts, and iOS build configuration. Phase 1 established the monorepo structure and basic screens.
todos:
  - id: account-state
    content: Create mobile account state management with useAppState hook adaptation
    status: pending
  - id: auth-screens
    content: Build Sign In and Sign Up screens for mobile authentication
    status: pending
  - id: account-selector
    content: Create account selector component for mobile with create/edit/delete
    status: pending
  - id: charts-dashboard
    content: Implement Dashboard charts using react-native-gifted-charts
    status: pending
  - id: date-filter-ui
    content: Add date filter picker UI component for mobile
    status: pending
  - id: tag-filter-ui
    content: Add tag filter UI component for mobile
    status: pending
  - id: trade-detail
    content: Create Trade Detail screen with edit/delete functionality
    status: pending
  - id: settings-screen
    content: Build Settings screen with theme toggle and starting balance
    status: pending
  - id: ios-polish
    content: Add iOS-specific UX (haptic feedback, native date pickers)
    status: pending
  - id: eas-build
    content: Configure Expo EAS Build for iOS TestFlight distribution
    status: pending
isProject: false
---

# React Native iOS App - Phase 2

## Current State (Phase 1 Complete)

The monorepo structure is established and working:

```
ProfitPath/
├── packages/shared/          # ✅ Shared hooks, reducers, utils
├── apps/web/                 # ✅ Web app using shared package
└── apps/mobile/              # ✅ Basic Expo app with navigation
    └── src/
        ├── screens/          # ✅ Dashboard, History, AddTrade (basic)
        ├── context/          # ✅ DateFilter, TagFilter, Theme
        └── navigation/       # ✅ Bottom tab navigator
```

**What's Working:**

- Monorepo with npm workspaces
- Shared `@profitpath/shared` package
- Web app builds successfully
- Mobile app scaffolding with 3 screens
- Context providers with async storage persistence

**What's Missing:**

- Account state management (selectedAccountId is hardcoded to null)
- Authentication UI (no sign in/sign up screens)
- Charts (placeholder only)
- Full trade management flow

---

## Phase 2 Tasks

### 1. Account State Management

**Problem:** The mobile screens have `selectedAccountId = null` hardcoded, so no trades are fetched.

**Solution:** Create a mobile-specific `useAppState` hook that:

- Loads accounts from Supabase
- Persists selected account to AsyncStorage
- Provides account CRUD operations

```javascript
// apps/mobile/src/hooks/useAppState.js
import { useState, useEffect, useCallback } from 'react';
import { useSupabase, useAuth, accountsReducer, ACCOUNTS_ACTIONS, initialAccountsState } from '@profitpath/shared';
import { storageJson } from '../utils/storage';

const STORAGE_KEY = 'profitpath_selected_account';

export const useAppState = () => {
  const supabase = useSupabase();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected account from storage on mount
  useEffect(() => {
    const loadSelectedAccount = async () => {
      const stored = await storageJson.get(STORAGE_KEY);
      if (stored) {
        setSelectedAccountId(stored);
      }
    };
    loadSelectedAccount();
  }, []);

  // Fetch accounts when authenticated
  useEffect(() => {
    if (!user?.id || authLoading) return;
    
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const mapped = data.map(acc => ({
          id: acc.id,
          name: acc.name,
          startingBalance: acc.starting_balance,
          currentBalance: acc.current_balance,
        }));
        setAccounts(mapped);
        
        // Auto-select first account if none selected
        if (!selectedAccountId && mapped.length > 0) {
          setSelectedAccountId(mapped[0].id);
        }
      }
      setIsLoading(false);
    };
    
    fetchAccounts();
  }, [user?.id, authLoading, supabase]);

  // Persist selected account to storage
  useEffect(() => {
    if (selectedAccountId) {
      storageJson.set(STORAGE_KEY, selectedAccountId);
    }
  }, [selectedAccountId]);

  const selectAccount = useCallback((accountId) => {
    setSelectedAccountId(accountId);
  }, []);

  // Get current account details
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return {
    accounts,
    selectedAccountId,
    selectedAccount,
    selectAccount,
    startingBalance: selectedAccount?.startingBalance ?? 0,
    isLoading: isLoading || authLoading,
  };
};
```

**Create AppStateContext** to share state across screens:

```javascript
// apps/mobile/src/context/AppStateContext.jsx
import React, { createContext, useContext } from 'react';
import { useAppState } from '../hooks/useAppState';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const appState = useAppState();
  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within AppStateProvider');
  }
  return context;
};
```

---

### 2. Authentication Screens

Create Sign In and Sign Up screens with the same design language as the web app.

**SignInScreen.jsx:**

- Email/password inputs
- Sign in button
- Link to sign up
- Error handling with alerts

**SignUpScreen.jsx:**

- Email/password/confirm password inputs
- Sign up button
- Link to sign in
- Email verification notice

**Navigation Flow:**

- If not authenticated, show Auth stack (SignIn, SignUp)
- If authenticated, show Main tabs (Dashboard, AddTrade, History)

```javascript
// apps/mobile/src/navigation/RootNavigator.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@profitpath/shared';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
```

---

### 3. Account Selector Component

A modal or sheet that allows users to:

- View all accounts
- Select an account
- Create new account
- Edit account (name, starting balance)
- Delete account (with confirmation)

**Location:** Can be accessed from a header button or settings.

---

### 4. Dashboard Charts

Implement real charts using `react-native-gifted-charts`:

**Charts to implement:**

1. **Account Balance Line Chart** - Balance over time
2. **Win/Loss Pie Chart** - Win rate visualization
3. **Cumulative P&L Chart** - Running profit/loss
4. **Monthly Bar Chart** - Net P&L per month

**Example using react-native-gifted-charts:**

```javascript
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
import { generateAccountBalanceData, generateWinLossData } from '@profitpath/shared';

// Line Chart
const balanceData = generateAccountBalanceData(trades, startingBalance);
const lineData = balanceData.map(d => ({ value: d.balance, label: d.date }));

<LineChart
  data={lineData}
  color="#10B981"
  thickness={2}
  hideDataPoints
  curved
  areaChart
  startFillColor="#10B98140"
  endFillColor="#10B98100"
/>

// Pie Chart
const winLossData = generateWinLossData(metrics.winningTrades, metrics.losingTrades);

<PieChart
  data={[
    { value: metrics.winRate, color: '#10B981' },
    { value: 100 - metrics.winRate, color: '#1F2937' }
  ]}
  donut
  innerRadius={40}
  radius={60}
/>
```

---

### 5. Date Filter UI

Create a modal or action sheet for selecting date ranges:

**Options:**

- All Time
- Last 7 Days
- Last 30 Days
- This Month
- Last Month
- Year to Date
- Custom Range (with date pickers)

**Component:** `DateFilterModal.jsx`

---

### 6. Tag Filter UI

Create a tag selection interface:

**Features:**

- List of all tags with checkboxes
- AND/OR toggle for filter mode
- Clear all button
- Visual indicator of active filters

**Component:** `TagFilterModal.jsx`

---

### 7. Trade Detail Screen

When tapping a trade in history:

- Navigate to detail screen
- Show all trade info (symbol, dates, prices, profit, notes, tags)
- Edit button → opens form
- Delete button → confirmation modal

**Navigation:**

```javascript
// In TradeHistoryScreen
const handleTradePress = (trade) => {
  navigation.navigate('TradeDetail', { tradeId: trade.id });
};
```

---

### 8. Settings Screen

Add a new tab or accessible from header:

**Settings options:**

- Theme toggle (Light / Dark / System)
- Account management (link to account selector)
- Sign out button
- App version info

---

### 9. iOS Polish

**Native feel improvements:**

- Haptic feedback on button presses (`expo-haptics`)
- Native date picker for trade entry/exit dates
- Pull-to-refresh on trade history
- Swipe-to-delete on trade rows
- Keyboard avoiding views
- Safe area handling

**Dependencies to add:**

```bash
npx expo install expo-haptics
```

---

### 10. EAS Build Configuration

**Steps:**

1. Install EAS CLI:
  ```bash
   npm install -g eas-cli
  ```
2. Initialize EAS in the project:
  ```bash
   cd apps/mobile
   eas init
  ```
3. Create `eas.json`:
  ```json
   {
     "cli": {
       "version": ">= 3.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": true
         }
       },
       "production": {
         "ios": {
           "buildConfiguration": "Release"
         }
       }
     },
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@email.com",
           "ascAppId": "your-app-store-connect-app-id"
         }
       }
     }
   }
  ```
4. Configure iOS signing:
  - Apple Developer account required
  - EAS can auto-manage certificates
5. Build for TestFlight:
  ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
  ```

---

## Implementation Order

**Recommended sequence:**

1. **Account State** (required for everything else to work)
2. **Authentication Screens** (users need to sign in)
3. **Account Selector** (users need to select an account)
4. **Trade Detail Screen** (complete the trade flow)
5. **Charts** (enhance dashboard)
6. **Date/Tag Filters UI** (improve filtering)
7. **Settings Screen** (user preferences)
8. **iOS Polish** (native feel)
9. **EAS Build** (distribution)

---

## Environment Setup Reminder

Before testing, ensure `.env` is configured:

```bash
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Testing the App

```bash
# From monorepo root
cd apps/mobile
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app for physical device
```

