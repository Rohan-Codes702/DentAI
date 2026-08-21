import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, Sparkles, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../hooks/useTheme';

const SYMPTOMS_LIST = [
  'Sharp Tooth Pain',
  'Bleeding Gums',
  'Sensitivity to Hot/Cold',
  'Swollen Gums or Jaw',
  'Chipped or Cracked Tooth',
  'Persistent Bad Breath',
  'Jaw Clicking or Pain',
  'Loose Tooth',
];

export const SymptomChecker = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one symptom');
      return;
    }

    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        triageLevel: selectedSymptoms.includes('Sharp Tooth Pain') || selectedSymptoms.includes('Loose Tooth')
          ? 'Urgent Evaluation'
          : 'Moderate Priority',
        possibleCauses: [
          'Potential Dental Caries / Enamel Decay',
          'Gingival Inflammation or Early Periodontitis',
        ],
        recommendedActions: [
          'Schedule an in-person dental consultation with X-ray scan',
          'Rinse gently with warm salt water',
          'Avoid extremely hot, cold, or sugary foods',
        ],
      });
    }, 1200);
  };

  const isUrgent = result?.triageLevel?.includes('Urgent');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="AI Symptom Checker" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Bot size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>AI Symptom Triage</Text>
            <Text style={styles.bannerSub}>
              Select symptoms to get instant preliminary guidance and find dentists nearby
            </Text>
          </View>
        </LinearGradient>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Select Symptoms</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose all symptoms you are currently experiencing:
        </Text>

        <View style={styles.chipGrid}>
          {SYMPTOMS_LIST.map((sym, idx) => {
            const active = selectedSymptoms.includes(sym);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? `${colors.primary}1A` : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleSymptom(sym)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: active ? colors.primary : colors.textPrimary }]}>
                  {active ? '✓ ' : '+ '}
                  {sym}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={analyzing ? 'Analyzing Symptoms...' : 'Analyze Symptoms with AI'}
          onPress={handleAnalyze}
          loading={analyzing}
          style={styles.btn}
        />

        {result && (
          <Card style={styles.resultCard}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeTitleRow}>
                <Sparkles size={16} color={colors.primary} />
                <Text style={[styles.badgeTitle, { color: colors.textPrimary }]}>AI Triage Result</Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: isUrgent ? colors.dangerSoft : colors.warningSoft }]}>
                <Text style={[styles.badgeText, { color: isUrgent ? colors.danger : colors.warning }]}>
                  {result.triageLevel}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Possible Conditions:</Text>
            {result.possibleCauses.map((c, i) => (
              <Text key={i} style={[styles.bulletItem, { color: colors.textSecondary }]}>
                • {c}
              </Text>
            ))}

            <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginTop: 12 }]}>Recommended Actions:</Text>
            {result.recommendedActions.map((a, i) => (
              <Text key={i} style={[styles.bulletItem, { color: colors.textSecondary }]}>
                ✓ {a}
              </Text>
            ))}

            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('BookAppointment')}
            >
              <Stethoscope size={16} color="#fff" />
              <Text style={styles.bookBtnText}>Book Dentist Consultation</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    gap: 12,
    marginBottom: 16,
  },
  bannerIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, lineHeight: 17 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  btn: { marginBottom: 16 },
  resultCard: { gap: 8 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeTitle: { fontSize: 15, fontWeight: '800' },
  badgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(148,163,184,0.15)', marginVertical: 6 },
  sectionHeading: { fontSize: 13, fontWeight: '800' },
  bulletItem: { fontSize: 13, lineHeight: 20, marginTop: 2 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default SymptomChecker;
