import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS } from '../../theme/tokens';

/**
 * Luxe card — bgCard, border, borderRadius 12. Optional gold top line on press (handled by parent if needed).
 */
export default function LuxeCard({ children, style, ...rest }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
});
