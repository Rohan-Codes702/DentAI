import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { patientService } from '../../services/patientService';
import { useTranslation } from 'react-i18next';

export const MedicalProfile = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
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
        if (mp.allergies) setAllergies(Array.isArray(mp.allergies) ? mp.allergies.join(', ') : mp.allergies);
        if (mp.medicalHistory) setMedicalHistory(Array.isArray(mp.medicalHistory) ? mp.medicalHistory.join(', ') : mp.medicalHistory);
        if (mp.currentMedications) setMedications(Array.isArray(mp.currentMedications) ? mp.currentMedications.join(', ') : mp.currentMedications);
        if (mp.emergencyContact) {
          if (typeof mp.emergencyContact === 'string') {
            setEmergencyContactName(mp.emergencyContact);
          } else {
            setEmergencyContactName(mp.emergencyContact.name || '');
            setEmergencyContactPhone(mp.emergencyContact.phone || '');
          }
        }
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
        allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
        medicalHistory: medicalHistory ? medicalHistory.split(',').map((s) => s.trim()) : [],
        currentMedications: medications ? medications.split(',').map((s) => s.trim()) : [],
        emergencyContact: {
          name: emergencyContactName,
          phone: emergencyContactPhone,
        },
      });
      Alert.alert(t('common.success'), t('medical.saved'));
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
          <Input label={t('medical.bloodGroup')} value={bloodGroup} onChangeText={setBloodGroup} placeholder={t('medical.bloodPlaceholder')} />
          <Input
            label={t('medical.allergies')}
            value={allergies}
            onChangeText={setAllergies}
            placeholder={t('medical.allergyPlaceholder')}
            multiline
          />
          <Input
            label={t('medical.history')}
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            placeholder={t('medical.historyPlaceholder')}
            multiline
          />
          <Input
            label={t('medical.medications')}
            value={medications}
            onChangeText={setMedications}
            placeholder={t('medical.medicationPlaceholder')}
            multiline
          />
          <Input
            label={t('medical.contactName')}
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            placeholder={t('medical.contactPlaceholder')}
          />
          <Input
            label={t('medical.contactPhone')}
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            placeholder={t('medical.phonePlaceholder')}
            keyboardType="phone-pad"
          />

          <Button title={t('medical.save')} onPress={handleSave} loading={loading} style={styles.btn} />
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
