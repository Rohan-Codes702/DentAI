import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Loader } from '../components/Loader';

import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DentistNavigator from './DentistNavigator';
import AdminNavigator from './AdminNavigator';
import { ROLES } from '../utils/constants';

export const RootNavigator = () => {
  const { user, isAuthenticated, initializing } = useAuth();
  const { theme } = useTheme();

  if (initializing) {
    return <Loader message="Initializing DentAI..." />;
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

  return <NavigationContainer theme={navigationTheme}>{renderRoleNavigator()}</NavigationContainer>;
};

export default RootNavigator;
