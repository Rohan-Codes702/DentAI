import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChevronRight, FileText } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { formatPatientDemographics } from '../utils/helpers';

export const PatientCard = ({ patient, onPress, reportsCount }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const demographics = formatPatientDemographics(patient);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Avatar uri={patient?.avatar?.url || patient?.profileImage} name={patient?.name} size={48} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{patient?.name || 'Patient'}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
            {demographics || patient?.email || 'No details on file'}
          </Text>
          {!!reportsCount && (
            <View style={styles.reportRow}>
              <FileText size={12} color={colors.primary} />
              <Text style={[styles.reportText, { color: colors.primary }]}>
                {reportsCount} diagnosis {reportsCount === 1 ? 'report' : 'reports'}
              </Text>
            </View>
          )}
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginVertical: 6, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  reportText: { fontSize: 11, fontWeight: '700' },
});

export default PatientCard;
