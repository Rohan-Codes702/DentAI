import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { authService } from '../../services/authService';
import { useTranslation } from 'react-i18next';

export const Settings = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t('common.error'), t('settings.fillPasswords'));
      return;
    }
    setLoading(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      Alert.alert(t('common.success'), t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>{t('settings.pushNotifications')}</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('settings.changePassword')}</Text>
          <Input
            label={t('settings.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <Input
            label={t('settings.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Button title={t('settings.updatePassword')} onPress={handleChangePassword} loading={loading} style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});

export default Settings;
