import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../theme/tokens';

/**
 * Modal container — overlay (backdrop, blur if available) + content (bgCard, border, shadow).
 * Title: display font; content uses mono/tokens.
 */
export default function LuxeModal({
  visible,
  onClose,
  title,
  children,
  showClose = true,
  contentStyle,
}) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlayBg }]}>
        <View style={[styles.content, { backgroundColor: colors.bgCard, borderColor: colors.border }, contentStyle]}>
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            {title != null && (
              <Text
                style={[
                  styles.title,
                  { color: colors.textPrimary, fontFamily: colors.fontDisplay },
                ]}
              >
                {title}
              </Text>
            )}
            {showClose && (
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={[styles.closeText, { color: colors.textSecondary, fontFamily: colors.fontMono }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {typeof children === 'function' ? children(colors) : children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '300',
  },
});
