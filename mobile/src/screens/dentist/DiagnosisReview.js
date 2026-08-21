import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  UserCircle2,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { doctorService } from '../../services/doctorService';
import { reportService } from '../../services/reportService';
import { useTheme } from '../../hooks/useTheme';
import { formatPatientAddress } from '../../utils/helpers';

const CONFIDENCE_THRESHOLD = 0.60; // 60%

export const DiagnosisReview = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [diagnosis, setDiagnosis] = useState(route?.params?.diagnosis || null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(!route?.params?.diagnosis);
  const [loadError, setLoadError] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDiagnosis = async () => {
      if (diagnosis) return;

      const diagnosisId = route?.params?.diagnosisId;
      if (!diagnosisId) {
        setLoadError('Diagnosis data was not provided. Please reopen the upload result.');
        setLoadingDiagnosis(false);
        return;
      }

      try {
        const res = await doctorService.getDiagnosisById(diagnosisId);
        if (res?.diagnosis) {
          setDiagnosis(res.diagnosis);
        } else {
          setLoadError('Diagnosis could not be loaded from the server.');
        }
      } catch (e) {
        setLoadError(e.message || 'Unable to load diagnosis details.');
      } finally {
        setLoadingDiagnosis(false);
      }
    };

    loadDiagnosis();
  }, [diagnosis, route?.params?.diagnosisId]);

  // Filter detections to only show those >= 60% confidence
  const allDetections = diagnosis?.aiDetections || [];
  const qualifyingDetections = allDetections.filter(
    (d) => (d.confidence || 0) >= CONFIDENCE_THRESHOLD
  );
  const hiddenCount = allDetections.length - qualifyingDetections.length;

  const handleConfirm = async () => {
    if (!diagnosis?._id) {
      Alert.alert('Missing Diagnosis', 'No diagnosis record is available to confirm.');
      return;
    }

    if (!notes.trim()) {
      Alert.alert('Notes Required', 'Please add your clinical notes and recommendations before confirming.');
      return;
    }

    setLoading(true);
    try {
      await doctorService.reviewDiagnosis(diagnosis._id, {
        confirmed: true,
        notes: notes.trim(),
        status: 'confirmed',
      });
      await reportService.generateReport(diagnosis._id);
      Alert.alert(
        '✅ Diagnosis Confirmed',
        'The diagnosis has been confirmed and a professional PDF report has been generated for the patient.',
        [
          {
            text: 'Back to Dashboard',
            onPress: () => navigation.navigate('DentistDashboard'),
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Report Generation Issue',
        e.message ||
          'Diagnosis was saved, but the PDF report could not be generated. The patient has been notified to check back later.'
      );
      navigation.navigate('DentistDashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!diagnosis?._id) return;

    Alert.alert(
      'Reject Diagnosis',
      'Are you sure you want to reject this AI diagnosis? The patient will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await doctorService.reviewDiagnosis(diagnosis._id, {
                confirmed: false,
                notes: notes.trim() || 'AI findings rejected after clinical review.',
                status: 'rejected',
              });
              Alert.alert('Rejected', 'The diagnosis has been marked as rejected.');
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to reject diagnosis');
            }
          },
        },
      ]
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.85) return '#ef4444'; // High confidence – red
    if (confidence >= 0.70) return '#f97316'; // Medium – orange
    return '#eab308'; // Low (but still >= 60%) – yellow
  };

  if (loadingDiagnosis) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="AI Diagnosis Review" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <ScanLine size={36} color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Loading diagnosis...
          </Text>
        </View>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="AI Diagnosis Review" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <AlertTriangle size={36} color={colors.warning} />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>
            Unable to load diagnosis
          </Text>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>{loadError}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="AI Diagnosis Review" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Banner */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.statusBanner}>
          <ScanLine size={20} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>AI Analysis Completed</Text>
            <Text style={styles.statusSub}>
              {qualifyingDetections.length} finding{qualifyingDetections.length !== 1 ? 's' : ''} detected above 60% confidence threshold
            </Text>
          </View>
        </LinearGradient>

        {/* Patient Card */}
        {diagnosis?.patient && (
          <Card style={styles.card}>
            <View style={styles.cardTitleRow}>
              <UserCircle2 size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Patient Information
              </Text>
            </View>
            <Text style={[styles.patientName, { color: colors.textPrimary }]}>
              {diagnosis.patient.name || 'Patient'}
            </Text>
            {diagnosis.patient.phone ? (
              <View style={styles.infoRow}>
                <Phone size={13} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {diagnosis.patient.phone}
                </Text>
              </View>
            ) : null}
            {diagnosis.patient.email ? (
              <View style={styles.infoRow}>
                <Mail size={13} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {diagnosis.patient.email}
                </Text>
              </View>
            ) : null}
            {diagnosis.patient.address ? (
              <View style={styles.infoRow}>
                <MapPin size={13} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {formatPatientAddress(diagnosis.patient)}
                </Text>
              </View>
            ) : null}
          </Card>
        )}

        {/* X-Ray Images */}
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <ScanLine size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              X-Ray Analysis
            </Text>
          </View>

          {(diagnosis?.annotatedImage?.url || diagnosis?.xrayImage?.url) ? (
            <Image
              source={{ uri: diagnosis.annotatedImage?.url || diagnosis.xrayImage?.url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceLight }]}>
              <ScanLine size={32} color={colors.primary} />
              <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>
                No image available
              </Text>
            </View>
          )}

          {/* Confidence Threshold Notice */}
          {hiddenCount > 0 && (
            <View style={[styles.thresholdNote, { backgroundColor: colors.infoSoft }]}>
              <ShieldAlert size={14} color={colors.primary} />
              <Text style={[styles.thresholdText, { color: colors.primary }]}>
                {hiddenCount} low-confidence detection{hiddenCount > 1 ? 's' : ''} hidden (below 60% threshold)
              </Text>
            </View>
          )}

          {/* Findings */}
          <Text style={[styles.findingsTitle, { color: colors.textSecondary }]}>
            Detected Conditions (≥60% confidence):
          </Text>

          {qualifyingDetections.length === 0 ? (
            <View style={[styles.noFindings, { backgroundColor: colors.surfaceLight }]}>
              <CheckCircle2 size={20} color={colors.success} />
              <Text style={[styles.noFindingsText, { color: colors.textSecondary }]}>
                No high-confidence detections found
              </Text>
            </View>
          ) : (
            qualifyingDetections.map((det, idx) => {
              const pct = Math.round((det.confidence || 0) * 100);
              const barColor = getConfidenceColor(det.confidence || 0);
              return (
                <View
                  key={idx}
                  style={[styles.detectionRow, { borderColor: colors.border }]}
                >
                  <View style={styles.detectionInfo}>
                    <Text style={[styles.detectionName, { color: colors.textPrimary }]}>
                      {det.className || `Finding #${idx + 1}`}
                    </Text>
                    <View style={[styles.confidenceBar, { backgroundColor: colors.surfaceLight }]}>
                      <View
                        style={[
                          styles.confidenceFill,
                          { width: `${pct}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={[styles.confBadge, { backgroundColor: `${barColor}18` }]}>
                    <Text style={[styles.confBadgeText, { color: barColor }]}>{pct}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* Dentist Review */}
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <ClipboardList size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Clinical Notes & Review
            </Text>
          </View>
          <Text style={[styles.notesHint, { color: colors.textSecondary }]}>
            Add your clinical assessment, treatment plan, and recommendations for the patient.
          </Text>
          <Input
            label="Professional Recommendation / Treatment Plan"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Recommend composite resin filling for tooth #14. Periapical region to be monitored. Schedule follow-up in 4 weeks."
            multiline
            numberOfLines={5}
          />

          <View style={styles.actionRow}>
            <Button
              title="Reject"
              variant="outline"
              onPress={handleReject}
              style={[styles.actionBtn, { borderColor: colors.danger }]}
            />
            <Button
              title="Confirm & Generate Report"
              onPress={handleConfirm}
              loading={loading}
              style={styles.confirmBtn}
            />
          </View>
        </Card>

        {/* Medical Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <ShieldAlert size={14} color={colors.textMuted} />
          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
            AI analysis is a preliminary decision-support tool (AI screening). It does not replace clinical examination. Only the dentist-approved findings will appear in the final patient report.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 14,
  },
  stateTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  stateText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  statusTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  statusSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  card: { marginBottom: 14 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  patientName: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  infoText: { fontSize: 13, flex: 1 },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 12,
  },
  imagePlaceholder: {
    height: 160,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  imagePlaceholderText: { fontSize: 13 },
  thresholdNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  thresholdText: { fontSize: 12, fontWeight: '600', flex: 1 },
  findingsTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  noFindings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  noFindingsText: { fontSize: 13 },
  detectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  detectionInfo: { flex: 1 },
  detectionName: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  confidenceBar: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: 999 },
  confBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 52,
    alignItems: 'center',
  },
  confBadgeText: { fontSize: 13, fontWeight: '800' },
  notesHint: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flex: 1 },
  confirmBtn: { flex: 2 },
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  disclaimerText: { fontSize: 11, lineHeight: 16, flex: 1 },
});

export default DiagnosisReview;
