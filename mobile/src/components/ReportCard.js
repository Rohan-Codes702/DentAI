import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FileText, CheckCircle2, Clock } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { formatDate } from '../utils/helpers';
import { Card } from './Card';
import { Button } from './Button';

export const ReportCard = ({ report, onDownload, onView }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const diagnosis = report.diagnosis || report;
  const summary = diagnosis.aiSummary || {};
  const findings = Array.isArray(summary.conditionsFound) && summary.conditionsFound.length > 0
    ? summary.conditionsFound
    : ['Panoramic Dental Scan'];

  const isVerified = diagnosis.status === 'confirmed';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Dental AI Diagnosis Report</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(report.createdAt || report.generatedAt || new Date())}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: isVerified ? colors.successSoft : colors.warningSoft }]}>
          {isVerified ? (
            <CheckCircle2 size={12} color={colors.success} />
          ) : (
            <Clock size={12} color={colors.warning} />
          )}
          <Text style={[styles.badgeText, { color: isVerified ? colors.success : colors.warning }]}>
            {isVerified ? 'Verified' : 'Pending Review'}
          </Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {diagnosis.annotatedImage?.url || diagnosis.xrayImage?.url ? (
          <Image
            source={{ uri: diagnosis.annotatedImage?.url || diagnosis.xrayImage?.url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb, { backgroundColor: colors.surfaceLight }]}>
            <FileText size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.details}>
          <Text style={[styles.findingsLabel, { color: colors.textSecondary }]}>Detected Conditions:</Text>
          {findings.map((finding, idx) => (
            <Text key={idx} style={[styles.findingItem, { color: colors.textPrimary }]} numberOfLines={1}>
              • {typeof finding === 'string' ? finding : `${finding.condition} (${finding.count})`}
            </Text>
          ))}
          <Text style={[styles.confidenceText, { color: colors.primary }]}>
            Avg Confidence: {((summary.averageConfidence || 0.88) * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Button
          title="View Report"
          variant="outline"
          onPress={onView}
          style={styles.btn}
        />
        <Button
          title="Download PDF"
          variant="primary"
          onPress={onDownload}
          style={styles.btn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  placeholderThumb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    marginLeft: 14,
    flex: 1,
  },
  findingsLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  findingItem: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },
  confidenceText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  btn: {
    flex: 1,
    minHeight: 44,
    marginVertical: 0,
  },
});
