import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, CalendarDays, MapPinned, FileText, MessageSquareMore, UserCircle2 } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

import HomeScreen from '../screens/patient/HomeScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import MedicalProfile from '../screens/patient/MedicalProfile';
import SymptomChecker from '../screens/patient/SymptomChecker';
import BookAppointment from '../screens/patient/BookAppointment';
import AppointmentHistory from '../screens/patient/AppointmentHistory';
import ReportsScreen from '../screens/patient/ReportsScreen';
import ChatScreen from '../screens/patient/ChatScreen';
import NearbyDentists from '../screens/patient/NearbyDentists';
import Notifications from '../screens/patient/Notifications';
import Settings from '../screens/patient/Settings';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientHome" component={HomeScreen} />
      <Stack.Screen name="SymptomChecker" component={SymptomChecker} />
      <Stack.Screen name="BookAppointment" component={BookAppointment} />
      <Stack.Screen name="NearbyDentists" component={NearbyDentists} />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
}

function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppointmentHistory" component={AppointmentHistory} />
      <Stack.Screen name="BookAppointment" component={BookAppointment} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientProfile" component={ProfileScreen} />
      <Stack.Screen name="MedicalProfile" component={MedicalProfile} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}

export const PatientNavigator = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
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
            HomeTab: Home,
            AppointmentsTab: CalendarDays,
            MapTab: MapPinned,
            ReportsTab: FileText,
            ChatTab: MessageSquareMore,
            ProfileTab: UserCircle2,
          };
          const Icon = iconMap[route.name] || Home;
          return <Icon size={size ?? 20} color={color} strokeWidth={2.2} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsStack} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="MapTab" component={NearbyDentists} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="ReportsTab" component={ReportsScreen} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default PatientNavigator;
