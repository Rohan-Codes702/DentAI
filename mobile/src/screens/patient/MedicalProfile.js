import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { patientService } from '../../services/patientService';

export const MedicalProfile = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin');
  const [medicalHistory, setMedicalHistory] = useState('Type 2 Diabetes');
  const [medications, setMedications] = useState('Metformin 500mg');
  const [emergencyContact, setEmergencyContact] = useState('Father: 9876500000');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientService.getProfile();
      if (res?.user?.medicalProfile) {
        const mp = res.user.medicalProfile;
        if (mp.bloodGroup) setBloodGroup(mp.bloodGroup);
        if (mp.allergies) setAllergies(mp.allergies.join(', '));
        if (mp.medicalHistory) setMedicalHistory(mp.medicalHistory.join(', '));
        if (mp.currentMedications) setMedications(mp.currentMedications.join(', '));
      }
    } catch (e) {
      console.log('Error loading medical profile', e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await patientService.updateProfile({
        bloodGroup,
        allergies: allergies.split(',').map((s) => s.trim()),
        medicalHistory: medicalHistory.split(',').map((s) => s.trim()),
        currentMedications: medications.split(',').map((s) => s.trim()),
        emergencyContact,
      });
      Alert.alert('Saved', 'Medical profile updated successfully');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.container}>
      <Header title="Medical Profile" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Input label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} placeholder="e.g. O+, A+, B-" />
          <Input
            label="Known Allergies"
            value={allergies}
            onChangeText={setAllergies}
            placeholder="e.g. Penicillin, Latex"
            multiline
          />
          <Input
            label="Medical History"
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            placeholder="e.g. Diabetes, Hypertension"
            multiline
          />
          <Input
            label="Current Medications"
            value={medications}
            onChangeText={setMedications}
            placeholder="e.g. Metformin, Aspirin"
            multiline
          />
          <Input
            label="Emergency Contact"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="Name & Phone number"
          />

          <Button title="Save Medical Profile" onPress={handleSave} loading={loading} style={styles.btn} />
        </View>
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
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    marginTop: 16,
  },
});

export default MedicalProfile;
