import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Stat value: display font, large.
 * Stat label: mono, tiny, uppercase, muted.
 */
export function LuxeStatValue({ children, style, ...rest }) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.value,
        { color: colors.textPrimary, fontFamily: colors.fontDisplay },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function LuxeStatLabel({ children, style, ...rest }) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.label,
        { color: colors.textMuted, fontFamily: colors.fontMono },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export default function LuxeStat({ label, value, style }) {
  return (
    <View style={[styles.container, style]}>
      <LuxeStatLabel>{label}</LuxeStatLabel>
      <LuxeStatValue>{value}</LuxeStatValue>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  value: {
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
});
