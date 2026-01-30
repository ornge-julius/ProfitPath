import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@profitpath/shared';
import { useTheme } from '../context/ThemeContext';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.logoRow}>
        <Text style={[styles.logoProfit, { color: colors.textPrimary, fontFamily: colors.fontDisplay }]}>Profit</Text>
        <Text style={[styles.logoPath, { color: colors.accentGold, fontFamily: colors.fontDisplay }]}>Path</Text>
      </View>
      <ActivityIndicator size="large" color={colors.accentGold} style={styles.spinner} />
    </View>
  );
}

/**
 * Root navigator that handles auth state and shows appropriate stack.
 */
export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, isLoading: themeLoading } = useTheme();

  // Show loading screen while checking auth or loading theme
  if (isLoading || themeLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoProfit: { fontSize: 32, fontWeight: '500', letterSpacing: -0.5 },
  logoPath: { fontSize: 32, fontWeight: '500', letterSpacing: -0.5 },
  spinner: {
    marginTop: 24,
  },
});
