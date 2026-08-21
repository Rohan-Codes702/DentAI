import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const STATUS_MAP = {
  confirmed: 'success',
  completed: 'success',
  verified: 'success',
  active: 'success',
  pending: 'warning',
  pending_review: 'warning',
  awaiting: 'warning',
  cancelled: 'danger',
  rejected: 'danger',
  no_show: 'danger',
  urgent: 'danger',
  default: 'neutral',
};

/**
 * Small colored pill used for appointment/diagnosis/notification status.
 * tone can be passed explicitly ('success' | 'warning' | 'danger' | 'info' | 'neutral')
 * or inferred from a raw status string.
 */
export const StatusBadge = ({ status, tone, label, size = 'md' }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const resolvedTone = tone || STATUS_MAP[String(status || '').toLowerCase()] || 'neutral';

  const palette = {
    success: { fg: colors.success, bg: colors.successSoft },
    warning: { fg: colors.warning, bg: colors.warningSoft },
    danger: { fg: colors.danger, bg: colors.dangerSoft },
    info: { fg: colors.primary, bg: colors.infoSoft },
    neutral: { fg: colors.textSecondary, bg: colors.surfaceLight },
  }[resolvedTone];

  const text = label || (status ? status.replace(/_/g, ' ') : '');
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg, borderColor: `${palette.fg}33` },
        isSmall && styles.badgeSmall,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.fg }]} />
      <Text style={[styles.text, { color: palette.fg }, isSmall && styles.textSmall]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: 10,
  },
});

export default StatusBadge;
