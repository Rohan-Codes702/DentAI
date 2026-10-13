import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Users, Upload, FileText, MessageSquareMore, UserRound } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

import Dashboard from '../screens/dentist/Dashboard';
import PatientList from '../screens/dentist/PatientList';
import UploadXray from '../screens/dentist/UploadXray';
import DiagnosisReview from '../screens/dentist/DiagnosisReview';
import ChatScreen from '../screens/dentist/ChatScreen';
import Reports from '../screens/dentist/Reports';
import Profile from '../screens/dentist/Profile';
import Notifications from '../screens/dentist/Notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DentistDashboard" component={Dashboard} />
      <Stack.Screen name="UploadXray" component={UploadXray} />
      <Stack.Screen name="DiagnosisReview" component={DiagnosisReview} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
}

export const DentistNavigator = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.glass,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          shadowColor: 'rgba(15,23,42,0.12)',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 1,
          shadowRadius: 18,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            DashboardTab: LayoutDashboard,
            PatientsTab: Users,
            UploadTab: Upload,
            ReportsTab: FileText,
            ChatTab: MessageSquareMore,
            ProfileTab: UserRound,
          };
          const Icon = iconMap[route.name] || LayoutDashboard;
          return <Icon size={size ?? 20} color={color} strokeWidth={2.2} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ tabBarLabel: t('navigation.dashboard') }} />
      <Tab.Screen name="PatientsTab" component={PatientList} options={{ tabBarLabel: t('navigation.patients') }} />
      <Tab.Screen name="UploadTab" component={UploadXray} options={{ tabBarLabel: t('home.uploadXray') }} />
      <Tab.Screen name="ReportsTab" component={Reports} options={{ tabBarLabel: t('navigation.reports') }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ tabBarLabel: t('navigation.chat') }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ tabBarLabel: t('navigation.profile') }} />
    </Tab.Navigator>
  );
};

export default DentistNavigator;
