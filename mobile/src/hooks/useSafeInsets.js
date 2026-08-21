import { Platform, StatusBar } from 'react-native';

let useSafeAreaInsetsLib = null;
try {
  // eslint-disable-next-line global-require
  useSafeAreaInsetsLib = require('react-native-safe-area-context').useSafeAreaInsets;
} catch (e) {
  useSafeAreaInsetsLib = null;
}

const FALLBACK = {
  top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 47,
  bottom: Platform.OS === 'ios' ? 24 : 0,
  left: 0,
  right: 0,
};

/**
 * Safe-area insets with a sane fallback so screens rendered before a
 * SafeAreaProvider mounts (or on setups without the package) never sit
 * behind the status bar / home indicator.
 */
export const useSafeInsets = () => {
  if (useSafeAreaInsetsLib) {
    try {
      return useSafeAreaInsetsLib();
    } catch (e) {
      return FALLBACK;
    }
  }
  return FALLBACK;
};

export default useSafeInsets;
