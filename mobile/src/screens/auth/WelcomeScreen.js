import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';

export const WelcomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />

      <View style={styles.heroArea}>
        <View style={[styles.badge, { backgroundColor: colors.glass, borderColor: colors.border }]}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>AI Powered Dental Diagnosis</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.brandRow}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Stethoscope size={28} color="#fff" />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>DentAI</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Modern tele-dentistry for patients, dentists, and clinics.</Text>
            </View>
          </View>

          <Text style={[styles.headline, { color: colors.textPrimary }]}>Premium oral care, AI screening, and effortless booking.</Text>
          <Text style={[styles.copy, { color: colors.textSecondary }]}>Track health scores, send X-rays for analysis, book appointments, and chat with your care team inside one polished workspace.</Text>

          <View style={styles.ctaRow}>
            <Button title="Get Started" onPress={() => navigation.navigate('Register')} icon={<ArrowRight size={18} color="#fff" />} />
            <Button title="Login" variant="outline" onPress={() => navigation.navigate('Login')} />
          </View>
        </View>

        <View style={[styles.featureRowWrap, { backgroundColor: theme.mode === 'dark' ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.72)' }]}>
          <View style={[styles.featureRow, { borderColor: colors.border }]}>
            <View style={styles.featureItem}>
              <ShieldCheck size={18} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>AI Reports</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.pill, { backgroundColor: colors.infoSoft }]}>
                <Text style={[styles.pillText, { color: colors.primary }]}>24/7</Text>
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Support</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  heroArea: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.72)',
    padding: 24,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 22,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  headline: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    maxWidth: 760,
  },
  copy: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 720,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  featureRowWrap: {
    marginTop: 18,
    borderRadius: 22,
    overflow: 'hidden',
  },
  featureRow: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pill: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
});