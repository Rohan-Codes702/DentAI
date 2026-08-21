import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const Skeleton = ({ width = '100%', height = 16, radius = 12, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.8, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceLight,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
};

export const SkeletonStack = ({ lines = 3, lastWidth = '68%', style }) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? lastWidth : '100%'} style={index > 0 ? styles.lineSpacing : null} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  lineSpacing: {
    marginTop: 10,
  },
});