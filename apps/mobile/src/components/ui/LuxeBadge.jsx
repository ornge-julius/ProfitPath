import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../theme/tokens';

/**
 * Win/loss badge — winBg/win and lossBg/loss, mono, small, uppercase, rounded.
 */
export function LuxeBadgeWin({ children, style, textStyle, ...rest }) {
  const { colors, isDark } = useTheme();
  const borderColor = isDark ? 'rgba(201, 169, 98, 0.3)' : 'rgba(107, 142, 35, 0.3)';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.winBg, borderColor },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.text,
          { color: colors.win, fontFamily: colors.fontMono },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function LuxeBadgeLoss({ children, style, textStyle, ...rest }) {
  const { colors, isDark } = useTheme();
  const borderColor = isDark ? 'rgba(139, 64, 73, 0.3)' : 'rgba(160, 64, 80, 0.3)';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.lossBg, borderColor },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.text,
          { color: colors.loss, fontFamily: colors.fontMono },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/**
 * Generic badge — pass variant 'win' | 'loss' or use LuxeBadgeWin / LuxeBadgeLoss.
 */
export default function LuxeBadge({ children, variant = 'win', ...rest }) {
  if (variant === 'loss') {
    return <LuxeBadgeLoss {...rest}>{children}</LuxeBadgeLoss>;
  }
  return <LuxeBadgeWin {...rest}>{children}</LuxeBadgeWin>;
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
