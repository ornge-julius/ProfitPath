import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SupabaseProvider } from '@profitpath/shared';
import 'react-native-url-polyfill/auto';

// Context Providers
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DateFilterProvider } from './src/context/DateFilterContext';
import { TagFilterProvider } from './src/context/TagFilterContext';
import { AppStateProvider } from './src/context/AppStateContext';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

// Initialize Supabase client with React Native configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Status bar wrapper component to access theme
function StatusBarWrapper() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SupabaseProvider client={supabase}>
      <ThemeProvider>
        <AppStateProvider>
          <DateFilterProvider>
            <TagFilterProvider>
              <RootNavigator />
              <StatusBarWrapper />
            </TagFilterProvider>
          </DateFilterProvider>
        </AppStateProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
