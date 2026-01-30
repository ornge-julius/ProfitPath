import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
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

// Theme & Fonts
import { luxeFonts } from './src/theme/fonts';
import { LUXE_DARK } from './src/theme/tokens';

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

// Splash shown while fonts load
function FontLoadingSplash() {
  return (
    <View style={[styles.loadingContainer, { backgroundColor: LUXE_DARK.bgPrimary }]}>
      <Text style={[styles.loadingLogo, { color: LUXE_DARK.accentGold }]}>ProfitPath</Text>
      <ActivityIndicator size="large" color={LUXE_DARK.accentGold} style={styles.spinner} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(luxeFonts);

  if (!fontsLoaded && !fontError) {
    return <FontLoadingSplash />;
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 36,
    letterSpacing: -1,
  },
  spinner: {
    marginTop: 24,
  },
});
