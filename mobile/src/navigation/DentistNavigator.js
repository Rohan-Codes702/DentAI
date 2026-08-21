import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Users, Upload, MessageSquareMore, UserRound } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

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
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
}

export const DentistNavigator = () => {
  const { theme } = useTheme();
  const { colors } = theme;

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
            ChatTab: MessageSquareMore,
            ProfileTab: UserRound,
          };
          const Icon = iconMap[route.name] || LayoutDashboard;
          return <Icon size={size ?? 20} color={color} strokeWidth={2.2} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="PatientsTab" component={PatientList} options={{ tabBarLabel: 'Patients' }} />
      <Tab.Screen name="UploadTab" component={UploadXray} options={{ tabBarLabel: 'Upload X-ray' }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ tabBarLabel: 'Doctor Profile' }} />
    </Tab.Navigator>
  );
};

export default DentistNavigator;
