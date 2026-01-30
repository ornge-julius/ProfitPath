import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '@profitpath/shared';
import { useAppStateContext } from '../context/AppStateContext';
import AccountSelectorModal from '../components/AccountSelectorModal';
import { lightHaptic, selectionHaptic, warningHaptic } from '../utils/haptics';

const SettingsRow = ({ label, value, onPress, themeColors, showChevron = true }) => (
  <TouchableOpacity
    style={[styles.row, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress}
  >
    <Text style={[styles.rowLabel, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>{label}</Text>
    <View style={styles.rowRight}>
      {value && (
        <Text style={[styles.rowValue, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>{value}</Text>
      )}
      {showChevron && onPress && (
        <Text style={[styles.chevron, { color: themeColors.textMuted, fontFamily: themeColors.fontMono }]}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

const SettingsSection = ({ title, children, themeColors }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export default function SettingsScreen() {
  const { colors: themeColors, themePreference, setTheme } = useTheme();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { selectedAccount, accounts } = useAppStateContext();
  
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleSignOut = async () => {
    warningHaptic();
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleThemeChange = () => {
    lightHaptic();
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme',
      [
        {
          text: 'Light',
          onPress: () => {
            selectionHaptic();
            setTheme(THEMES.LIGHT);
          },
        },
        {
          text: 'Dark',
          onPress: () => {
            selectionHaptic();
            setTheme(THEMES.DARK);
          },
        },
        {
          text: 'System',
          onPress: () => {
            selectionHaptic();
            setTheme(THEMES.SYSTEM);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (themePreference) {
      case THEMES.LIGHT:
        return 'Light';
      case THEMES.DARK:
        return 'Dark';
      case THEMES.SYSTEM:
        return 'System';
      default:
        return 'System';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>Settings</Text>
        </View>

        <SettingsSection title="Account" themeColors={themeColors}>
          <SettingsRow label="Current Account" value={selectedAccount?.name || 'No account selected'} onPress={() => setShowAccountModal(true)} themeColors={themeColors} />
          <SettingsRow label="Starting Balance" value={selectedAccount ? `$${selectedAccount.startingBalance.toLocaleString()}` : '-'} themeColors={themeColors} showChevron={false} />
          <SettingsRow label="Total Accounts" value={accounts.length.toString()} themeColors={themeColors} showChevron={false} />
        </SettingsSection>

        <SettingsSection title="Appearance" themeColors={themeColors}>
          <SettingsRow label="Theme" value={getThemeLabel()} onPress={handleThemeChange} themeColors={themeColors} />
        </SettingsSection>

        <SettingsSection title="User" themeColors={themeColors}>
          <SettingsRow label="Email" value={user?.email || '-'} themeColors={themeColors} showChevron={false} />
        </SettingsSection>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }, isSigningOut && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={isSigningOut}
          activeOpacity={0.7}
        >
          {isSigningOut ? (
            <ActivityIndicator color={themeColors.loss} />
          ) : (
            <Text style={[styles.signOutText, { color: themeColors.loss, fontFamily: themeColors.fontMono }]}>Sign Out</Text>
          )}
        </TouchableOpacity>

        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: themeColors.textMuted, fontFamily: themeColors.fontMono }]}>
            ProfitPath v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Account Selector Modal */}
      <AccountSelectorModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 16,
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  signOutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  appVersion: {
    fontSize: 14,
  },
});
