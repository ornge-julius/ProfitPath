import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, colors } from '../context/ThemeContext';

import DashboardScreen from '../screens/DashboardScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';
import AddTradeScreen from '../screens/AddTradeScreen';
import TagsScreen from '../screens/TagsScreen';
import ComparisonScreen from '../screens/ComparisonScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused, color, size = 24 }) {
  return <Ionicons name={name} size={size} color={color} />;
}

/**
 * Bottom tab navigator: Dashboard, History, New Trade, Tags, Compare.
 * Active tab uses gold (accent); tab bar uses Luxe surface/border.
 */
function TabNavigator() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.bgCard ?? themeColors.surface,
          borderTopColor: themeColors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: themeColors.accentGold ?? themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="History"
        component={TradeHistoryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} color={color} />
          ),
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="NewTrade"
        component={AddTradeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="add-circle" color={color} size={28} />
          ),
          tabBarLabel: 'New Trade',
        }}
      />
      <Tab.Screen
        name="Tags"
        component={TagsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'pricetags' : 'pricetags-outline'} color={color} />
          ),
          tabBarLabel: 'Tags',
        }}
      />
      <Tab.Screen
        name="Compare"
        component={ComparisonScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'git-compare' : 'git-compare-outline'} color={color} />
          ),
          tabBarLabel: 'Compare',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main stack: tabs + TradeDetail. TradeDetail keeps stack header for back.
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
