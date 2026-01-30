import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Text with web-matching font. Use variant so all copy uses Cormorant Garamond (display)
 * or IBM Plex Mono (body/labels) exactly like the web app.
 * - display: headings, page titles, section titles, logo, stat values (Cormorant Garamond)
 * - mono: body, labels, buttons, inputs, table content (IBM Plex Mono)
 */
export function LuxeTextDisplay({ style, children, ...rest }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontFamily: colors.fontDisplay }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function LuxeTextMono({ style, children, ...rest }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontFamily: colors.fontMono }, style]} {...rest}>
      {children}
    </Text>
  );
}
