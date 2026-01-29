import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { SupabaseProvider } from '@profitpath/shared';

// Context Providers
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DateFilterProvider } from './src/context/DateFilterContext';
import { TagFilterProvider } from './src/context/TagFilterContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Initialize Supabase client
// Note: For Expo, you can use app.config.js to set these values
// or use environment variables via expo-constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Status bar wrapper component to access theme
function StatusBarWrapper() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SupabaseProvider client={supabase}>
      <ThemeProvider>
        <DateFilterProvider>
          <TagFilterProvider>
            <AppNavigator />
            <StatusBarWrapper />
          </TagFilterProvider>
        </DateFilterProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
