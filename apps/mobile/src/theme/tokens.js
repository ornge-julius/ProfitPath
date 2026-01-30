/**
 * Monochrome Luxe design tokens — single source of truth aligned with web (apps/web/src/index.css).
 * Use these for all screens and components so mobile and web share the same palette and spacing.
 */

// Light theme — warm cream palette
export const LUXE_LIGHT = {
  // Backgrounds
  bgPrimary: '#FAF8F5',
  bgSurface: '#F5F2ED',
  bgCard: '#FFFFFF',
  bgElevated: '#EFEBE5',

  // Borders
  border: '#E5E0D8',
  borderSubtle: '#EDE9E3',
  borderAccent: '#D4CFC5',

  // Text
  textPrimary: '#1A1A1D',
  textSecondary: '#5A5A5D',
  textMuted: '#8B8B8E',

  // Accents
  accentGold: '#9E7C3C',
  accentGoldLight: '#B8924A',
  accentGoldDim: '#7A5F2E',

  // Win / Loss
  win: '#6B8E23',
  winBg: 'rgba(107, 142, 35, 0.1)',
  loss: '#A04050',
  lossBg: 'rgba(160, 64, 80, 0.1)',

  // Shadows (React Native: shadowColor, shadowOffset, shadowOpacity, shadowRadius / elevation)
  shadowSm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  shadowMd: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  shadowLg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  shadowGlow: { shadowColor: '#9E7C3C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 4 },

  // Typography (font family names — loaded via expo-font)
  fontDisplay: 'CormorantGaramond_500Medium',
  fontMono: 'IBMPlexMono_500Medium',
  fontBody: 'IBMPlexMono_400Regular',

  // Chart
  chartLine: '#1A1A1D',
  chartGrid: '#E5E0D8',
  chartAxis: '#8B8B8E',

  // Modal overlay
  overlayBg: 'rgba(250, 248, 245, 0.9)',

  // Backward-compat aliases for existing themeColors.* usage
  background: '#FAF8F5',
  surface: '#F5F2ED',
  primary: '#9E7C3C',
  success: '#6B8E23',
  danger: '#A04050',
  text: '#1A1A1D',
};

// Dark theme — deep charcoal with warm gold
export const LUXE_DARK = {
  bgPrimary: '#0A0A0B',
  bgSurface: '#141416',
  bgCard: '#1A1A1D',
  bgElevated: '#222225',

  border: '#2A2A2E',
  borderSubtle: '#1F1F22',
  borderAccent: '#3A3A3E',

  textPrimary: '#F5F5F5',
  textSecondary: '#8B8B8E',
  textMuted: '#5A5A5D',

  accentGold: '#C9A962',
  accentGoldLight: '#D4B87A',
  accentGoldDim: '#8B7444',

  win: '#C9A962',
  winBg: 'rgba(201, 169, 98, 0.12)',
  loss: '#8B4049',
  lossBg: 'rgba(139, 64, 73, 0.12)',

  shadowSm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 2, elevation: 2 },
  shadowMd: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 4 },
  shadowLg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 8 },
  shadowGlow: { shadowColor: '#C9A962', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 40, elevation: 4 },

  fontDisplay: 'CormorantGaramond_500Medium',
  fontMono: 'IBMPlexMono_500Medium',
  fontBody: 'IBMPlexMono_400Regular',

  chartLine: '#C9A962',
  chartGrid: '#2A2A2E',
  chartAxis: '#5A5A5D',

  overlayBg: 'rgba(10, 10, 11, 0.9)',

  // Backward-compat aliases
  background: '#0A0A0B',
  surface: '#141416',
  primary: '#C9A962',
  success: '#C9A962',
  danger: '#8B4049',
  text: '#F5F5F5',
};

// Spacing (matches web --space-unit: 8px)
export const SPACING = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};
