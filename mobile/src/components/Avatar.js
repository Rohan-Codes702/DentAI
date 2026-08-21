import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getInitials } from '../utils/helpers';

/**
 * Circular avatar. Falls back to initials-on-brand-color when no image is
 * available (never a broken-image icon), with an optional online indicator.
 */
export const Avatar = ({ uri, name, size = 44, online, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const dim = { width: size, height: size, borderRadius: size / 2 };
  const dotSize = Math.max(10, Math.round(size * 0.28));

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image source={{ uri }} style={[dim, styles.image, { borderColor: colors.border }]} />
      ) : (
        <View style={[dim, styles.fallback, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name) || '?'}</Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: online ? colors.success : colors.textMuted,
              borderColor: colors.surface,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderWidth: 2,
  },
});

export default Avatar;
