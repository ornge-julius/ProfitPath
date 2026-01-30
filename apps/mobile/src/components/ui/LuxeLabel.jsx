import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../theme/tokens';

/**
 * Label — mono, small, uppercase, letterSpacing, textSecondary.
 */
export default function LuxeLabel({ children, style, ...rest }) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.label,
        { color: colors.textSecondary, fontFamily: colors.fontMono },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
});
