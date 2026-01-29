import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, colors } from '../context/ThemeContext';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';
import AddTradeScreen from '../screens/AddTradeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Simple icon components
const DashboardIcon = ({ color }) => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>📊</Text>
  </View>
);

const HistoryIcon = ({ color }) => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>📜</Text>
  </View>
);

const AddIcon = ({ color }) => (
  <View style={[styles.addIcon, { borderColor: color }]}>
    <Text style={[styles.addIconText, { color }]}>+</Text>
  </View>
);

const SettingsIcon = ({ color }) => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>⚙️</Text>
  </View>
);

/**
 * Bottom tab navigator with main app screens.
 */
function TabNavigator() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
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
          tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
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
          tabBarIcon: ({ color }) => <HistoryIcon color={color} />,
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main stack navigator that includes tabs and modal screens.
 */
export default function MainNavigator() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="TradeDetail"
        component={TradeDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Trade Details',
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
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
