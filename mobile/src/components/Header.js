import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';

export const Header = ({ title, subtitle, showBack = false, onBackPress, rightElement }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 48;

  return (
    <View style={[styles.blurWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop }]}>
      <View style={styles.container}>
        <View style={styles.leftRow}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={[styles.backBtn, { backgroundColor: colors.surfaceLight }]} activeOpacity={0.7}>
              <ChevronLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement && <View>{rightElement}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurWrap: {
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleWrap: {
    flex: 1,
  },
  backBtn: {
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});
