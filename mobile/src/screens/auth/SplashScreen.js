import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { Stethoscope, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export const SplashScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.container}>
      <View style={[styles.orb, { backgroundColor: colors.primary, top: 70, right: -30 }]} />
      <View style={[styles.orb, { backgroundColor: colors.secondary, bottom: 80, left: -20 }]} />

      <View style={[styles.cardWrap, { backgroundColor: theme.mode === 'dark' ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.72)' }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.logoRow}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
              <Stethoscope size={24} color="#fff" />
            </View>
            <View>
              <Text style={[styles.brand, { color: colors.textPrimary }]}>DentAI</Text>
              <Text style={[styles.tag, { color: colors.textSecondary }]}>AI-powered Tele-Dentistry</Text>
            </View>
          </View>

          <View style={[styles.hero, { borderColor: colors.border }]}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Precision dental care, designed for speed.</Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>Screening, diagnosis, booking, and care in one premium health workspace.</Text>
          </View>

          <View style={styles.loadingRow}>
            <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.secondary }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.accent }]} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  orb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    opacity: 0.16,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
  },
  tag: {
    fontSize: 13,
    marginTop: 2,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    gap: 10,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 21,
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});