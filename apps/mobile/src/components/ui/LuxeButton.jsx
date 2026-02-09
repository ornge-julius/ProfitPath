import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Primary: gold gradient, dark text, uppercase mono.
 * Secondary: transparent, border; on press border/text gold.
 */
export function LuxeButtonPrimary({ onPress, title, disabled, loading, style, textStyle, ...rest }) {
  const { colors, isDark } = useTheme();
  const textColor = isDark ? colors.bgPrimary : '#0A0A0B';

  const content = loading ? (
    <ActivityIndicator size="small" color={textColor} />
  ) : (
    <Text
      style={[
        styles.primaryText,
        { color: textColor, fontFamily: colors.fontMono },
        textStyle,
      ]}
      numberOfLines={1}
    >
      {title}
    </Text>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.button, style]}
      {...rest}
    >
      <LinearGradient
        colors={isDark ? [colors.accentGold, colors.accentGoldLight, colors.accentGold] : ['#9E7C3C', '#B8924A', '#9E7C3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        {content}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function LuxeButtonSecondary({ onPress, title, disabled, style, textStyle, ...rest }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        styles.secondary,
        {
          borderColor: colors.border,
          backgroundColor: 'transparent',
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.secondaryText,
          { color: colors.textPrimary, fontFamily: colors.fontMono },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    height: '100%',
    width: '100%',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  secondary: {
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
