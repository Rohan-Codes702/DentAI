import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FileText, CheckCircle2, Clock } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { formatDate } from '../utils/helpers';
import { Card } from './Card';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

const FINDING_KEYS = {
  caries: 'Caries',
  'periapical lesion': 'Periapical Lesion',
  'impacted tooth': 'Impacted Tooth',
  'tooth discoloration': 'Tooth Discoloration',
  'missing tooth': 'Missing Tooth',
  'root resorption': 'Root Resorption',
  'crown fracture': 'Crown Fracture',
  'bone loss': 'Bone Loss',
  'periodontal disease': 'Periodontal Disease',
  calculus: 'Calculus',
  filling: 'Filling',
  crown: 'Crown',
};

export const ReportCard = ({ report, onDownload, onView }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  const diagnosis = report.diagnosis || report;
  const summary = diagnosis.aiSummary || {};
  const findings = Array.isArray(summary.conditionsFound) && summary.conditionsFound.length > 0
    ? summary.conditionsFound
    : ['Panoramic Dental Scan'];

  const isVerified = diagnosis.status === 'confirmed';
  const translateFinding = (value) => {
    const normalized = String(value).toLowerCase();
    const key = FINDING_KEYS[normalized] || value;
    return t(`diseases.${key}`, { defaultValue: value });
  };

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
            {isVerified ? t('reports.verified') : t('reports.pendingReview')}
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
          <Text style={[styles.findingsLabel, { color: colors.textSecondary }]}>{t('reports.detectedConditions')}</Text>
          {findings.map((finding, idx) => (
            <Text key={idx} style={[styles.findingItem, { color: colors.textPrimary }]} numberOfLines={1}>
              • {typeof finding === 'string' ? translateFinding(finding) : `${translateFinding(finding.condition)} (${finding.count})`}
            </Text>
          ))}
          <Text style={[styles.confidenceText, { color: colors.primary }]}>
            {t('reports.avgConfidence', { value: ((summary.averageConfidence || 0.88) * 100).toFixed(0) })}
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
