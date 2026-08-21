import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const Card = ({ children, style, onPress, glass = false }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const Container = onPress ? TouchableOpacity : View;

  const dynamicCardStyle = {
    backgroundColor: glass ? 'rgba(255, 255, 255, 0.78)' : colors.surface,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  };

  const containerProps = onPress ? { onPress, activeOpacity: 0.88 } : {};

  return (
    <Container
      style={[styles.card, dynamicCardStyle, style]}
      {...containerProps}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 14px 32px rgba(15,23,42,0.06)' }
      : {
          shadowColor: 'rgba(15,23,42,0.06)',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 16,
        }),
    elevation: 3,
  },
});
