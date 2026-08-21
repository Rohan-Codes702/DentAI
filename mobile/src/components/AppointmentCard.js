import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';
import { formatDate, getStatusColor } from '../utils/helpers';
import { Card } from './Card';

export const AppointmentCard = ({ appointment, onCancel, onAction, userRole = 'patient' }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const isPatient = userRole === 'patient';
  const personName = isPatient
    ? appointment.dentist?.name || 'Dr. Dentist'
    : appointment.patient?.name || 'Patient';
  const subtitle = isPatient
    ? appointment.dentist?.dentistProfile?.specialization || 'Dental Surgeon'
    : appointment.reason || 'Routine Checkup';

  const statusColor = getStatusColor(appointment.status);

  return (
    <Card style={styles.card}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.personName}>{personName}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{appointment.status || 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.rowBetween}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>DATE</Text>
          <Text style={styles.infoValue}>{formatDate(appointment.date)}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>TIME SLOT</Text>
          <Text style={styles.infoValue}>{appointment.timeSlot || '10:00 AM'}</Text>
        </View>
      </View>

      {appointment.reason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{appointment.reason}</Text>
        </View>
      )}

      {(onCancel || onAction) && (
        <View style={styles.actionRow}>
          {onCancel && appointment.status !== 'cancelled' && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {onAction && (
            <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
              <Text style={styles.actionText}>Details</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: fonts.weights.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  reasonContainer: {
    marginTop: 10,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  reasonText: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginRight: 8,
  },
  cancelText: {
    color: colors.danger,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  actionText: {
    color: '#ffffff',
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
});
