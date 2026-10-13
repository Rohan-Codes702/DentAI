import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Loader } from '../components/Loader';
import { useTranslation } from 'react-i18next';

import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DentistNavigator from './DentistNavigator';
import AdminNavigator from './AdminNavigator';
import { ROLES } from '../utils/constants';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const RootNavigator = () => {
  const { user, isAuthenticated, initializing } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (initializing) {
    return <Loader message={t('common.initializing')} />;
  }

  const renderRoleNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    switch (user.role) {
      case ROLES.DENTIST:
        return <DentistNavigator />;
      case ROLES.ADMIN:
        return <AdminNavigator />;
      case ROLES.PATIENT:
      default:
        return <PatientNavigator />;
    }
  };

  const navigationTheme = theme.mode === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          border: theme.colors.border,
          primary: theme.colors.primary,
          text: theme.colors.textPrimary,
          notification: theme.colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          border: theme.colors.border,
          primary: theme.colors.primary,
          text: theme.colors.textPrimary,
          notification: theme.colors.primary,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={styles.root}>
        {renderRoleNavigator()}
        <View style={styles.languageSwitcher}>
          <LanguageSwitcher />
        </View>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  languageSwitcher: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : 44,
    right: 16,
    zIndex: 100,
    elevation: 100,
  },
});

export default RootNavigator;
