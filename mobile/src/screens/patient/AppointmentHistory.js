import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { AppointmentCard } from '../../components/AppointmentCard';
import { appointmentService } from '../../services/appointmentService';

export const AppointmentHistory = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      if (res?.appointments) {
        setAppointments(res.appointments);
      } else {
        setAppointments([
          {
            _id: 'a1',
            date: '2026-08-05',
            timeSlot: '10:00 AM - 10:30 AM',
            status: 'confirmed',
            reason: 'Tooth pain & scaling',
            dentist: { name: 'Dr. Rohan Mane', dentistProfile: { specialization: 'Orthodontist' } },
          },
        ]);
      }
    } catch (e) {
      console.log('Error fetching appointments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentService.updateStatus(id, { status: 'cancelled' });
            fetchAppointments();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="My Appointments" />

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointments} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            userRole="patient"
            onCancel={() => handleCancel(item._id || item.id)}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No appointments booked yet</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
  },
});

export default AppointmentHistory;
