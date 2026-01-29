import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@profitpath/shared';
import { useTheme, colors } from '../context/ThemeContext';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

/**
 * Loading screen shown while checking auth state.
 */
function LoadingScreen() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.logo, { color: themeColors.primary }]}>ProfitPath</Text>
      <ActivityIndicator size="large" color={themeColors.primary} style={styles.spinner} />
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
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  spinner: {
    marginTop: 24,
  },
});
