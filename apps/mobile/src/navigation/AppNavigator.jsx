import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, colors } from '../context/ThemeContext';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';
import AddTradeScreen from '../screens/AddTradeScreen';

const Tab = createBottomTabNavigator();

// Simple icon components (you can replace with actual icons later)
const DashboardIcon = ({ color }) => (
  <View style={[styles.icon, { backgroundColor: color }]}>
    <Text style={styles.iconText}>📊</Text>
  </View>
);

const HistoryIcon = ({ color }) => (
  <View style={[styles.icon, { backgroundColor: color }]}>
    <Text style={styles.iconText}>📜</Text>
  </View>
);

const AddIcon = ({ color }) => (
  <View style={[styles.addIcon, { borderColor: color }]}>
    <Text style={[styles.addIconText, { color }]}>+</Text>
  </View>
);

export default function AppNavigator() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: themeColors.surface,
            borderTopColor: themeColors.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
          },
          tabBarActiveTintColor: themeColors.primary,
          tabBarInactiveTintColor: themeColors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color }) => <DashboardIcon color="transparent" />,
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen
          name="AddTrade"
          component={AddTradeScreen}
          options={{
            tabBarIcon: ({ color }) => <AddIcon color={color} />,
            tabBarLabel: 'Add Trade',
          }}
        />
        <Tab.Screen
          name="History"
          component={TradeHistoryScreen}
          options={{
            tabBarIcon: ({ color }) => <HistoryIcon color="transparent" />,
            tabBarLabel: 'History',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  iconText: {
    fontSize: 18,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
});
