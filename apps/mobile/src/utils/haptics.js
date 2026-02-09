import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for iOS native feel.
 * Falls back gracefully on Android or when haptics aren't available.
 */

// Light feedback for selections and toggles
export const lightHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
};

// Medium feedback for button presses
export const mediumHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
};

// Heavy feedback for significant actions
export const heavyHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }
};

// Success feedback (notification style)
export const successHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
};

// Warning feedback (notification style)
export const warningHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }
};

// Error feedback (notification style)
export const errorHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }
};

// Selection feedback (for pickers and selections)
export const selectionHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.selectionAsync().catch(() => {});
  }
};
