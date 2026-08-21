import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';

/**
 * Small metric tile used on the patient/dentist/admin dashboards
 * (e.g. "Today's Appointments: 6", "Pending Reviews: 3").
 */
export const StatCard = ({ icon, label, value, tone = 'primary', trend, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const toneColor = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[tone] || colors.primary;

  const toneSoft = {
    primary: colors.infoSoft,
    success: colors.successSoft,
    warning: colors.warningSoft,
    danger: colors.dangerSoft,
  }[tone] || colors.infoSoft;

  return (
    <Card style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: toneSoft }]}>{icon}</View>
      <Text style={[styles.value, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={2}>{label}</Text>
      {!!trend && (
        <Text style={[styles.trend, { color: toneColor }]} numberOfLines={1}>{trend}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    marginVertical: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  trend: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
});

export default StatCard;
