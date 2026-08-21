import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AlertCircle, Activity } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/helpers';

const confidenceTone = (value) => {
  if (value >= 0.85) return { label: 'High confidence', tone: 'success' };
  if (value >= 0.6) return { label: 'Medium confidence', tone: 'warning' };
  return { label: 'Low confidence', tone: 'danger' };
};

/**
 * Used in the dentist's AI diagnosis review queue and reports lists.
 * Purely presentational — expects an already-fetched diagnosis object.
 */
export const DiagnosisCard = ({ diagnosis, onPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const summary = diagnosis?.aiSummary || {};
  const conditions = Array.isArray(summary.conditionsFound) ? summary.conditionsFound : [];
  const confidence = summary.averageConfidence ?? diagnosis?.confidence ?? 0.8;
  const conf = confidenceTone(confidence);
  const hasUrgent = conditions.some((c) => (typeof c === 'object' ? c.severity === 'Urgent' : false));

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {diagnosis?.xrayImage?.url ? (
          <Image source={{ uri: diagnosis.xrayImage.url }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.surfaceLight }]}>
            <Activity size={20} color={colors.primary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.patient, { color: colors.textPrimary }]} numberOfLines={1}>
            {diagnosis?.patient?.name || 'Patient X-ray'}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(diagnosis?.createdAt)}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={diagnosis?.status || 'pending'} size="sm" />
            {hasUrgent && (
              <View style={[styles.urgentPill, { backgroundColor: colors.dangerSoft }]}>
                <AlertCircle size={11} color={colors.danger} />
                <Text style={[styles.urgentText, { color: colors.danger }]}>Urgent finding</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.confidenceRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.conditionsText, { color: colors.textSecondary }]} numberOfLines={1}>
          {conditions.length > 0
            ? conditions.map((c) => (typeof c === 'string' ? c : c.condition)).join(', ')
            : 'Awaiting AI analysis'}
        </Text>
        <StatusBadge tone={conf.tone} label={conf.label} size="sm" />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginVertical: 8 },
  row: { flexDirection: 'row' },
  thumb: { width: 64, height: 64, borderRadius: 14 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  patient: { fontSize: 15, fontWeight: '700' },
  date: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  urgentPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  urgentText: { fontSize: 10, fontWeight: '800' },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    gap: 10,
  },
  conditionsText: { flex: 1, fontSize: 12, fontWeight: '600' },
});

export default DiagnosisCard;
