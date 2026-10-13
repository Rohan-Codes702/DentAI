import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';

export const Header = ({ title, subtitle, showBack = false, onBackPress, rightElement }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const translateTitle = (value) => {
    if (value?.startsWith('Chat with ')) {
      return t('screenTitles.Chat with {{name}}', { name: value.slice('Chat with '.length), defaultValue: value });
    }
    return t(`screenTitles.${value}`, { defaultValue: value });
  };

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
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{translateTitle(title)}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{translateTitle(subtitle)}</Text>}
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
    shadowColor: 'rgba(23,59,58,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
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
