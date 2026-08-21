import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';

/**
 * Standard "nothing here yet" state for lists (appointments, diagnoses,
 * dentists, notifications, patients, messages, etc).
 */
export const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const Icon = icon || Inbox;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
        <Icon size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {!!message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
      {!!actionLabel && !!onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  compact: {
    paddingVertical: 28,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 280,
  },
  button: {
    marginTop: 18,
    minWidth: 180,
  },
});

export default EmptyState;
