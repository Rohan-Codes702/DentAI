import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShieldCheck, Users, Building2, ChartColumnIncreasing, Settings2 } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

import Dashboard from '../screens/admin/Dashboard';
import ManageDoctors from '../screens/admin/ManageDoctors';
import ManagePatients from '../screens/admin/ManagePatients';
import ManageHospitals from '../screens/admin/ManageHospitals';
import Analytics from '../screens/admin/Analytics';

const Tab = createBottomTabNavigator();

export const AdminNavigator = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.warning,
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
            AdminDashboard: ShieldCheck,
            ManageDoctors: Users,
            ManagePatients: Building2,
            ManageHospitals: ChartColumnIncreasing,
            Analytics: Settings2,
          };
          const Icon = iconMap[route.name] || ShieldCheck;
          return <Icon size={size ?? 20} color={color} strokeWidth={2.2} />;
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={Dashboard} options={{ tabBarLabel: 'Admin' }} />
      <Tab.Screen name="ManageDoctors" component={ManageDoctors} options={{ tabBarLabel: 'Doctors' }} />
      <Tab.Screen name="ManagePatients" component={ManagePatients} options={{ tabBarLabel: 'Patients' }} />
      <Tab.Screen name="ManageHospitals" component={ManageHospitals} options={{ tabBarLabel: 'Hospitals' }} />
      <Tab.Screen name="Analytics" component={Analytics} options={{ tabBarLabel: 'Analytics' }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
