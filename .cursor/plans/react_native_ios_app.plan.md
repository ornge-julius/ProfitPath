---
name: React Native iOS App
overview: Create a separate React Native iOS app that shares maximum business logic (hooks, utils, reducers) with the existing web app while using the same Supabase backend. The project will use a monorepo structure with a shared package.
todos:
  - id: setup-monorepo
    content: Set up monorepo structure with npm workspaces, move web app to apps/web
    status: pending
  - id: extract-shared
    content: Create packages/shared with all platform-agnostic hooks, utils, and reducers
    status: pending
  - id: create-expo
    content: Initialize Expo project in apps/mobile with required dependencies
    status: pending
  - id: storage-adapter
    content: Create AsyncStorage adapter and port context providers
    status: pending
  - id: navigation
    content: Set up React Navigation with bottom tab navigator
    status: pending
  - id: core-screens
    content: Build Dashboard, Trade History, and Trade Form screens
    status: pending
  - id: charts
    content: Implement charts using react-native-gifted-charts
    status: pending
  - id: ios-build
    content: Configure Expo EAS Build for iOS TestFlight distribution
    status: pending
isProject: false
---

# React Native iOS App for ProfitPath

## Architecture Overview

Create a **monorepo structure** that extracts shared business logic into a common package, allowing both the web app and the new React Native iOS app to consume the same code.

```mermaid
graph TB
    subgraph monorepo [Monorepo Root]
        shared[packages/shared]
        web[apps/web - Existing React App]
        mobile[apps/mobile - New React Native App]
    end
    
    subgraph backend [Backend]
        supabase[Supabase]
    end
    
    shared --> web
    shared --> mobile
    web --> supabase
    mobile --> supabase
```



## Recommended Tech Stack


| Layer      | Technology                   | Rationale                                          |
| ---------- | ---------------------------- | -------------------------------------------------- |
| Framework  | **Expo** (managed workflow)  | Faster development, easier iOS builds, OTA updates |
| Navigation | React Navigation             | Industry standard for RN                           |
| Storage    | AsyncStorage                 | localStorage replacement                           |
| Styling    | NativeWind (Tailwind for RN) | Reuse Tailwind knowledge from web                  |
| Charts     | react-native-gifted-charts   | Similar API to Recharts                            |
| State      | Context + Reducers           | Same pattern as web app                            |


## Project Structure

```
/Users/jcware/code/projects/ProfitPath/
├── packages/
│   └── shared/                    # NEW: Shared business logic
│       ├── package.json
│       ├── src/
│       │   ├── hooks/             # Platform-agnostic hooks
│       │   ├── reducers/          # All reducers (as-is)
│       │   ├── utils/             # calculations.js (as-is)
│       │   ├── types/             # TypeScript types (optional)
│       │   └── supabase/          # Supabase client factory
│       └── index.js
├── apps/
│   ├── web/                       # MOVED: Current /app folder
│   │   └── (existing web app)
│   └── mobile/                    # NEW: React Native iOS app
│       ├── app.json
│       ├── App.tsx
│       ├── src/
│       │   ├── components/        # RN UI components
│       │   ├── screens/           # Screen components
│       │   ├── navigation/        # React Navigation setup
│       │   ├── context/           # Adapted context providers
│       │   └── adapters/          # Storage adapters
│       └── package.json
└── package.json                   # Monorepo root (npm workspaces)
```

## Shared Code Strategy

### Directly Reusable (copy as-is to `packages/shared`)


| File                  | Path                                  | Notes                |
| --------------------- | ------------------------------------- | -------------------- |
| calculations.js       | `app/src/utils/calculations.js`       | All pure functions   |
| accountsReducer.js    | `app/src/reducers/accountsReducer.js` | Pure reducer         |
| tradeReducer.js       | `app/src/reducers/tradeReducer.js`    | Pure reducer         |
| usersReducer.js       | `app/src/reducers/usersReducer.js`    | Pure reducer         |
| useAuth.js            | `app/src/hooks/useAuth.js`            | Uses Supabase only   |
| useTradeManagement.js | `app/src/hooks/useTradeManagement.js` | Uses Supabase only   |
| useFilteredTrades.js  | `app/src/hooks/useFilteredTrades.js`  | Pure filtering logic |
| useTagManagement.js   | `app/src/hooks/useTagManagement.js`   | Wrapper hook         |


### Needs Adaptation (platform-specific layer)


| File                  | Web Dependency              | React Native Replacement          |
| --------------------- | --------------------------- | --------------------------------- |
| useAppState.js        | `localStorage`              | `AsyncStorage`                    |
| DateFilterContext.jsx | `localStorage`, URL params  | `AsyncStorage`, navigation state  |
| TagFilterContext.jsx  | `localStorage`, URL params  | `AsyncStorage`, navigation state  |
| ThemeContext.jsx      | `localStorage`, DOM classes | `AsyncStorage`, RN Appearance API |


### Cannot Share (platform-specific UI)

- All components in `app/src/components/` (React DOM vs React Native)
- Recharts charts → rebuild with react-native-gifted-charts
- Tailwind styles → adapt with NativeWind

## Implementation Steps

### Phase 1: Monorepo Setup

1. Create `packages/shared/` directory with package.json
2. Move existing `app/` to `apps/web/`
3. Configure npm workspaces in root package.json
4. Extract shared code to `packages/shared/`
5. Update web app imports to use `@profitpath/shared`

### Phase 2: React Native Project

1. Create Expo project in `apps/mobile/`
2. Install dependencies: `@supabase/supabase-js`, `date-fns`, `@react-native-async-storage/async-storage`, `react-navigation`, `nativewind`
3. Create storage adapter that wraps AsyncStorage with same interface as localStorage
4. Port context providers with storage adapter

### Phase 3: Core Features

1. Build navigation structure (Tab Navigator with Dashboard, Trade History, Add Trade)
2. Create screen components that mirror web views
3. Build UI components (cards, forms, tables as lists)
4. Integrate shared hooks and business logic

### Phase 4: Charts and Polish

1. Implement charts using react-native-gifted-charts
2. Add iOS-specific UX (haptic feedback, native date pickers)
3. Configure Expo EAS Build for iOS distribution

## Key Files to Create

### Root package.json (monorepo config)

```json
{
  "name": "profitpath",
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

### packages/shared/package.json

```json
{
  "name": "@profitpath/shared",
  "version": "1.0.0",
  "main": "src/index.js",
  "dependencies": {
    "@supabase/supabase-js": "^2.56.1",
    "date-fns": "^4.1.0"
  }
}
```

### Storage Adapter Pattern

```javascript
// apps/mobile/src/adapters/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
```

## Dependencies for React Native App

```json
{
  "dependencies": {
    "@profitpath/shared": "*",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@supabase/supabase-js": "^2.56.1",
    "date-fns": "^4.1.0",
    "expo": "~50.0.0",
    "nativewind": "^2.0.11",
    "react-native-gifted-charts": "^1.4.0"
  }
}
```

## Risks and Mitigations


| Risk                      | Mitigation                                                                      |
| ------------------------- | ------------------------------------------------------------------------------- |
| Monorepo complexity       | Start simple with npm workspaces; consider Turborepo later if needed            |
| Chart library differences | Prioritize functionality over visual parity; charts may look slightly different |
| iOS build complexity      | Use Expo EAS Build to handle signing and provisioning                           |


