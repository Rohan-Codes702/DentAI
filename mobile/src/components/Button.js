import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | danger
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceLight;
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (variant === 'outline') return colors.primary;
    return '#ffffff';
  };

  const content = loading ? (
    <ActivityIndicator color={getTextColor()} size="small" />
  ) : (
    <>
      {icon}
      <Text style={[styles.text, { color: getTextColor() }, icon && { marginLeft: 8 }, textStyle]}>
        {title}
      </Text>
    </>
  );

  const useGradient = variant === 'primary' && !disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        !useGradient && { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary },
        disabled && { opacity: 0.72 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {useGradient ? (
        <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.inner, { backgroundColor: getBackgroundColor() }]}>{content}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    minHeight: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
});
