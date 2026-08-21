import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

export const SectionHeader = ({ title, subtitle, actionLabel = 'See all', onAction, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.row, style]}>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {!!onAction && (
        <TouchableOpacity onPress={onAction} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.actionText, { color: colors.primary }]}>{actionLabel}</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
    gap: 12,
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 1,
  },
});

export default SectionHeader;
