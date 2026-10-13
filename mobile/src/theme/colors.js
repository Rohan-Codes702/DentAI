// DentAI design system — color tokens
// Clinical teal + warm coral healthcare palette. Light-only by design.

const brand = {
  primary: '#0F766E',
  primaryDark: '#115E59',
  secondary: '#F97361',
  secondaryDark: '#E85D4A',
  accent: '#F4B860',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#2A9D8F',
};

export const lightColors = {
  ...brand,
  background: '#F3FAF8',
  backgroundSoft: '#E1F3EF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FCFB',
  surfaceLight: '#EAF7F4',
  surfaceTint: 'rgba(255, 255, 255, 0.78)',
  glass: 'rgba(255, 255, 255, 0.82)',
  textPrimary: '#173B3A',
  textSecondary: '#52706D',
  textMuted: '#8BA7A3',
  onPrimary: '#FFFFFF',
  border: '#D8EAE6',
  borderStrong: '#BBD9D4',
  cardShadow: 'rgba(23, 59, 58, 0.08)',
  overlay: 'rgba(23, 59, 58, 0.42)',
  successSoft: 'rgba(22, 163, 74, 0.12)',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  dangerSoft: 'rgba(220, 38, 38, 0.12)',
  infoSoft: 'rgba(42, 157, 143, 0.14)',
};

// Static default export kept for any legacy `import { colors } from theme/colors`
// call sites — always resolves to the (only) light palette. Prefer useTheme()
// in new code so a screen never has to think about which palette is active.
export const colors = lightColors;

export const gradients = {
  primary: ['#2A9D8F', '#115E59'],
  soft: ['#FFFFFF', '#E1F3EF'],
};

// Kept accepting an argument for backward compatibility with existing call
// sites (e.g. getGradient(theme.mode === 'dark')) — always resolves to the
// light sky-blue gradient now that dark mode has been removed.
export const getGradient = () => ['#FFFFFF', '#EAF7F4', '#F3FAF8'];
