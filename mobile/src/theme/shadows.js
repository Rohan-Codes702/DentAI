import { Platform } from 'react-native';

// Soft, medical-grade elevation. Pass the active theme's shadow color so
// dark mode gets a deeper/blacker shadow instead of the light-mode tint.
export const makeShadow = (level = 'md', shadowColor = 'rgba(15,23,42,0.08)') => {
  const levels = {
    sm: { offset: 2, opacity: 1, radius: 6, elevation: 2 },
    md: { offset: 6, opacity: 1, radius: 16, elevation: 4 },
    lg: { offset: 14, opacity: 1, radius: 28, elevation: 8 },
  };
  const cfg = levels[level] || levels.md;

  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${cfg.offset}px ${cfg.radius}px ${shadowColor}` };
  }

  return {
    shadowColor,
    shadowOffset: { width: 0, height: cfg.offset },
    shadowOpacity: cfg.opacity,
    shadowRadius: cfg.radius,
    elevation: cfg.elevation,
  };
};

export default makeShadow;
