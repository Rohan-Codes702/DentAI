import { Dimensions, PixelRatio, Platform, useWindowDimensions } from 'react-native';

// Baseline design was authored against a 375pt-wide device (iPhone SE/12 mini
// class). Everything scales relative to that so text/spacing feel right on
// small phones, standard phones, large phones, and tablets alike.
const BASE_WIDTH = 375;

export const BREAKPOINTS = {
  small: 360, // small Android phones
  medium: 400, // standard phones
  large: 480, // large phones / phablets
  tablet: 768,
};

const { width: initialWidth } = Dimensions.get('window');

/**
 * Scale a size proportionally to screen width, clamped so it never shrinks
 * or grows further than `min`/`max` (defaults keep things sane on tablets).
 */
export const scale = (size, { min = size * 0.85, max = size * 1.25, width = initialWidth } = {}) => {
  const value = (width / BASE_WIDTH) * size;
  return Math.round(Math.max(min, Math.min(max, value)));
};

// Font scaling additionally respects the user's OS accessibility text size
// up to a sane cap so headings don't overflow on max accessibility settings.
export const scaleFont = (size, opts = {}) => {
  const scaled = scale(size, opts);
  const fontScale = PixelRatio.getFontScale();
  return Math.round(scaled * Math.min(fontScale, 1.3));
};

export const moderateScale = (size, factor = 0.5, width = initialWidth) => {
  return size + (scale(size, { width }) - size) * factor;
};

export const getDeviceSize = (width = initialWidth) => {
  if (width < BREAKPOINTS.small) return 'xsmall';
  if (width < BREAKPOINTS.medium) return 'small';
  if (width < BREAKPOINTS.large) return 'medium';
  if (width < BREAKPOINTS.tablet) return 'large';
  return 'tablet';
};

/**
 * Hook form of the helpers above — reacts to rotation / window resizing
 * (important for the web target and split-screen Android).
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const deviceSize = getDeviceSize(width);
  const isSmallDevice = width < BREAKPOINTS.small;
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLandscape = width > height;

  return {
    width,
    height,
    deviceSize,
    isSmallDevice,
    isTablet,
    isLandscape,
    scale: (size, opts) => scale(size, { ...opts, width }),
    scaleFont: (size, opts) => scaleFont(size, { ...opts, width }),
    // Content max width keeps large phones/tablets/web from stretching
    // cards edge-to-edge into unreadably wide rows.
    contentMaxWidth: isTablet ? 640 : width,
    columns: isTablet ? 2 : 1,
    horizontalPadding: isSmallDevice ? 14 : 20,
  };
};

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export default {
  scale,
  scaleFont,
  moderateScale,
  getDeviceSize,
  useResponsive,
  BREAKPOINTS,
};
