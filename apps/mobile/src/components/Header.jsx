import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../theme/tokens';

/**
 * Shared header: "ProfitPath" (Path in gold), date filter, tag filter, theme toggle, account.
 * Use tokens and Luxe styling to match web header.
 */
export default function Header({
  onDateFilter,
  onTagFilter,
  onThemeToggle,
  onAccountPress,
  showFilters = true,
}) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.sm,
          paddingHorizontal: SPACING.md,
          backgroundColor: colors.bgPrimary,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoRow}>
        <Text
          style={[
            styles.logoProfit,
            { color: colors.textPrimary, fontFamily: colors.fontDisplay },
          ]}
        >
          Profit
        </Text>
        <Text
          style={[
            styles.logoPath,
            { color: colors.accentGold, fontFamily: colors.fontDisplay },
          ]}
        >
          Path
        </Text>
      </View>

      {/* Right: filters, theme, account */}
      <View style={styles.rightRow}>
        {showFilters && (
          <>
            {onDateFilter && (
              <TouchableOpacity
                onPress={onDateFilter}
                style={[styles.iconButton, { borderColor: colors.border }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {onTagFilter && (
              <TouchableOpacity
                onPress={onTagFilter}
                style={[styles.iconButton, { borderColor: colors.border }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </>
        )}
        {onThemeToggle && (
          <TouchableOpacity
            onPress={onThemeToggle}
            style={[styles.iconButton, { borderColor: colors.border }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isDark ? 'moon-outline' : 'sunny-outline'}
              size={20}
              color={colors.accentGold}
            />
          </TouchableOpacity>
        )}
        {onAccountPress && (
          <TouchableOpacity
            onPress={onAccountPress}
            style={[styles.iconButton, { borderColor: colors.border }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoProfit: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  logoPath: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
