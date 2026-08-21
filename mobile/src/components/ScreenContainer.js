import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

// react-native-safe-area-context is the standard Expo dependency for this,
// but we degrade gracefully (matching the conditional-require pattern already
// used elsewhere in this codebase, e.g. NearbyDentists' WebView import) in
// case a screen renders before the provider mounts or the package is absent.
let useSafeAreaInsets = null;
try {
  // eslint-disable-next-line global-require
  useSafeAreaInsets = require('react-native-safe-area-context').useSafeAreaInsets;
} catch (e) {
  useSafeAreaInsets = null;
}

const useInsets = () => {
  if (useSafeAreaInsets) {
    try {
      return useSafeAreaInsets();
    } catch (e) {
      // Provider not mounted above this tree yet — fall through to defaults.
    }
  }
  return {
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 47,
    bottom: Platform.OS === 'ios' ? 24 : 0,
    left: 0,
    right: 0,
  };
};

/**
 * Standard screen shell used across DentAI.
 *
 * - Respects status bar / notch / home indicator via safe-area insets
 * - Optionally scrolls (default true) with keyboard-safe behavior for forms
 * - Applies the current theme's background so there's never a white flash
 *   when navigating between screens
 *
 * Usage:
 *   <ScreenContainer scroll keyboardAware>
 *     ...form fields...
 *   </ScreenContainer>
 */
export const ScreenContainer = ({
  children,
  scroll = true,
  keyboardAware = false,
  padded = true,
  edges = ['top', 'bottom'],
  contentContainerStyle,
  style,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useInsets();

  const bg = backgroundColor || colors.background;
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;

  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        contentContainerStyle: [
          padded && styles.padded,
          { paddingBottom: paddingBottom + (padded ? 24 : 0) },
          contentContainerStyle,
        ],
        keyboardShouldPersistTaps: 'handled',
        showsVerticalScrollIndicator: false,
      }
    : { style: [padded && styles.padded, { flex: 1, paddingBottom }, contentContainerStyle] };

  const content = (
    <Body {...bodyProps}>{children}</Body>
  );

  return (
    <View style={[styles.flex, { backgroundColor: bg, paddingTop }, style]}>
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { flexGrow: 1, paddingHorizontal: 20 },
});

export default ScreenContainer;
