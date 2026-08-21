import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { TIME_SLOTS } from '../../utils/constants';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';

export const BookAppointment = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const doctorParam = route?.params;
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState(null);
  const getTodayIsoDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [date, setDate] = useState(getTodayIsoDate());
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [reason, setReason] = useState('Routine checkup & scaling');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(TIME_SLOTS);

  const isValidIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());

  useEffect(() => {
    fetchDentists();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [selectedDentist, date]);

  const fetchDentists = async () => {
    try {
      const res = await patientService.getNearbyDentists();
      const nextDentists = Array.isArray(res?.dentists) ? res.dentists : [];
      setDentists(nextDentists);

      if (nextDentists.length > 0) {
        if (doctorParam?.dentistId) {
          const match = nextDentists.find(
            (d) => d._id === doctorParam.dentistId || d.id === doctorParam.dentistId
          );
          if (match) {
            setSelectedDentist(match);
          } else if (doctorParam?.doctor) {
            setDentists([doctorParam.doctor, ...nextDentists]);
            setSelectedDentist(doctorParam.doctor);
          } else {
            setSelectedDentist(nextDentists[0]);
          }
        } else {
          setSelectedDentist(nextDentists[0]);
        }
      } else {
        setSelectedDentist(null);
      }
    } catch (e) {
      console.log('Error loading dentists list:', e);
      setDentists([]);
      setSelectedDentist(null);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedDentist?._id || !isValidIsoDate(date)) {
      setAvailableSlots(TIME_SLOTS);
      return;
    }

    try {
      const res = await appointmentService.getAvailability(selectedDentist._id, date);
      const slots = Array.isArray(res?.availableSlots) && res.availableSlots.length > 0
        ? res.availableSlots
        : [];
      setAvailableSlots(slots);
      if (slots.length > 0 && !slots.includes(selectedSlot)) {
        setSelectedSlot(slots[0]);
      }
    } catch (error) {
      console.log('Error loading availability:', error);
      setAvailableSlots(TIME_SLOTS);
    }
  };

  const handleBook = async () => {
    if (!selectedDentist) {
      Alert.alert('Selection Required', 'Please select a dentist');
      return;
    }

    if (!isValidIsoDate(date)) {
      Alert.alert('Invalid Date', 'Please enter the date in YYYY-MM-DD format.');
      return;
    }

    setLoading(true);
    try {
      await appointmentService.createAppointment({
        dentistId: selectedDentist._id || selectedDentist.id,
        date,
        timeSlot: selectedSlot,
        reason,
      });
      Alert.alert('Success 🎉', 'Appointment booked successfully!', [
        { text: 'View Appointments', onPress: () => navigation.navigate('AppointmentHistory') },
      ]);
    } catch (err) {
      Alert.alert('Booking Error', err.message || 'Slot already booked or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.container}>
      <Header title="Book Appointment" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Select Dentist</Text>
        {dentists.length === 0 ? (
          <Text style={styles.emptyState}>No dentists are available right now.</Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dentistRow}>
          {dentists.map((d, idx) => {
            const isSelected = selectedDentist?._id === d._id;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.dentistCard, isSelected && styles.dentistCardActive]}
                onPress={() => setSelectedDentist(d)}
              >
                <Text style={styles.doctorAvatar}>🩺</Text>
                <Text style={[styles.doctorName, isSelected && styles.textActive]}>{d.name}</Text>
                <Text style={styles.doctorSpec}>{d.dentistProfile?.specialization || 'General Dentist'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>2. Date & Reason</Text>
        <Input label="Appointment Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Input label="Reason for Visit" value={reason} onChangeText={setReason} placeholder="Tooth pain, cleaning, etc." multiline />

        <Text style={styles.sectionTitle}>3. Select Available Time Slot</Text>
        <View style={styles.slotGrid}>
          {TIME_SLOTS.map((slot, idx) => {
            const isAvailable = availableSlots.includes(slot);
            const isSelected = selectedSlot === slot;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.slotBtn,
                  !isAvailable && styles.slotBtnDisabled,
                  isSelected && isAvailable && styles.slotBtnActive,
                ]}
                onPress={() => isAvailable && setSelectedSlot(slot)}
                disabled={!isAvailable}
              >
                <Text
                  style={[
                    styles.slotText,
                    !isAvailable && styles.slotTextDisabled,
                    isSelected && isAvailable && styles.slotTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title="Confirm Appointment" onPress={handleBook} loading={loading} style={styles.bookBtn} />
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginVertical: 12,
  },
  dentistRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dentistCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dentistCardActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  doctorAvatar: {
    fontSize: 28,
    marginBottom: 6,
  },
  doctorName: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  doctorSpec: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  textActive: {
    color: colors.primary,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotBtn: {
    width: '48%',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotBtnDisabled: {
    opacity: 0.4,
  },
  slotText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semibold,
  },
  slotTextDisabled: {
    color: colors.textMuted,
  },
  slotTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookBtn: {
    marginTop: 16,
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.xs,
    marginBottom: 8,
  },
});

export default BookAppointment;
