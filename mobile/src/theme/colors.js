// DentAI design system — color tokens
// Sky blue + white healthcare palette. Light-only by design (no dark theme).

const brand = {
  primary: '#38BDF8',
  primaryDark: '#0284C7',
  secondary: '#0EA5E9',
  secondaryDark: '#0284C7',
  accent: '#38BDF8',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
};

export const lightColors = {
  ...brand,
  background: '#F8FCFF',
  backgroundSoft: '#EAF6FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FCFF',
  surfaceLight: '#EFF8FF',
  surfaceTint: 'rgba(255, 255, 255, 0.78)',
  glass: 'rgba(255, 255, 255, 0.82)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  onPrimary: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.42)',
  successSoft: 'rgba(22, 163, 74, 0.12)',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  dangerSoft: 'rgba(220, 38, 38, 0.12)',
  infoSoft: 'rgba(56, 189, 248, 0.14)',
};

// Static default export kept for any legacy `import { colors } from theme/colors`
// call sites — always resolves to the (only) light palette. Prefer useTheme()
// in new code so a screen never has to think about which palette is active.
export const colors = lightColors;

export const gradients = {
  primary: ['#38BDF8', '#0284C7'],
  soft: ['#FFFFFF', '#EAF6FF'],
};

// Kept accepting an argument for backward compatibility with existing call
// sites (e.g. getGradient(theme.mode === 'dark')) — always resolves to the
// light sky-blue gradient now that dark mode has been removed.
export const getGradient = () => ['#FFFFFF', '#EAF6FF', '#F8FCFF'];
