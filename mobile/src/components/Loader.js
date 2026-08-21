import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stethoscope } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';
import { SkeletonStack } from './Skeleton';

export const Loader = ({ message = 'Loading DentAI...' }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
      <View style={[styles.logo, { backgroundColor: colors.glass, borderColor: colors.border }]}>
        <Stethoscope size={26} color={colors.primary} />
      </View>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>}
      <View style={styles.skeletonGroup}>
        <SkeletonStack lines={3} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 18,
  },
  text: {
    marginTop: 16,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
  },
  skeletonGroup: {
    width: '100%',
    maxWidth: 320,
    marginTop: 26,
  },
});
