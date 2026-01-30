import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../theme/tokens';

/**
 * Luxe text input — bgSurface, border, borderRadius 8, mono. Focus border gold (handled via focus state if needed).
 */
export default function LuxeInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable,
  multiline,
  style,
  inputStyle,
  ...rest
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label != null && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontFamily: colors.fontMono,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: colors.fontMono,
          },
          inputStyle,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
  },
});
