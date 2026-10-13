import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { doctorService } from '../../services/doctorService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';

export const Profile = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const dispatch = useDispatch();
  const { user, logout, updateAvatar } = useAuth();
  
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const dp = user?.dentistProfile || {};

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(dp.specialization || '');
  const [licenseNumber, setLicenseNumber] = useState(dp.licenseNumber || '');
  const [experienceYears, setExperienceYears] = useState(dp.experienceYears ? String(dp.experienceYears) : '');
  const [clinicName, setClinicName] = useState(dp.clinicName || '');
  const [clinicAddress, setClinicAddress] = useState(dp.clinicAddress || '');
  const [bio, setBio] = useState(dp.bio || '');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await doctorService.getProfile();
      if (res?.user) {
        dispatch(setUser(res.user));
        populateForm(res.user);
      }
    } catch (e) {
      console.log('Failed to fetch doctor profile:', e);
    }
  };

  const populateForm = (u) => {
    const p = u?.dentistProfile || {};
    setName(u?.name || '');
    setPhone(u?.phone || '');
    setSpecialization(p.specialization || '');
    setLicenseNumber(p.licenseNumber || '');
    setExperienceYears(p.experienceYears ? String(p.experienceYears) : '');
    setClinicName(p.clinicName || '');
    setClinicAddress(p.clinicAddress || '');
    setBio(p.bio || '');
  };

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert('Update Profile Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Photo Library', onPress: () => openLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await doUpload(result.assets[0].uri);
    }
  };

  const openLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await doUpload(result.assets[0].uri);
    }
  };

  const doUpload = async (uri) => {
    setUploading(true);
    try {
      const res = await updateAvatar(uri);
      if (!res.success) {
        Alert.alert('Upload Failed', res.message || 'Could not update profile photo. Try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await doctorService.updateProfile({
        name,
        phone,
        specialization,
        licenseNumber,
        experienceYears,
        clinicName,
        clinicAddress,
        bio,
      });

      if (res?.user) {
        dispatch(setUser(res.user));
        Alert.alert('Success', 'Profile updated successfully.');
        setEditing(false);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.container}>
      <Header title="Dentist Profile" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {/* Tappable avatar with camera overlay */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleAvatarPress}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {user?.avatar?.url ? (
                <Image source={{ uri: user.avatar.url }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarEmoji}>🩺</Text>
              )}
            </View>

            {/* Camera badge overlay */}
            <View style={styles.cameraBadge}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.cameraIcon}>📷</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.tapHint}>Tap to change photo</Text>
          <Text style={styles.name}>{user?.name ? `Dr. ${user.name}` : 'Doctor Profile'}</Text>
          <Text style={styles.spec}>{dp.specialization || 'Dental Specialist'}</Text>
          <Text style={styles.clinic}>
            {dp.clinicName ? `${dp.clinicName}` : 'Practice Registered'}
            {dp.clinicAddress ? ` • ${dp.clinicAddress}` : ''}
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Practice Info</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.info}>License No: {dp.licenseNumber || 'Not provided'}</Text>
          <Text style={styles.info}>Experience: {dp.experienceYears ? `${dp.experienceYears} Years` : 'Not provided'}</Text>
          <Text style={styles.info}>
            Verification Status: {dp.isVerified ? 'Verified ✓' : 'Pending Verification'}
          </Text>
          {user?.phone ? <Text style={styles.info}>Phone: {user.phone}</Text> : null}
          {user?.email ? <Text style={styles.info}>Email: {user.email}</Text> : null}
          {dp.bio ? <Text style={[styles.info, { marginTop: 8, fontStyle: 'italic' }]}>Bio: "{dp.bio}"</Text> : null}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editing} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Practice Profile</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              <Input label="Full Name" value={name} onChangeText={setName} placeholder="Dr. Rohan Mane" />
              <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" />
              <Input label="Specialization" value={specialization} onChangeText={setSpecialization} placeholder="Orthodontics & Dental Surgery" />
              <Input label="License Number" value={licenseNumber} onChangeText={setLicenseNumber} placeholder="MH-DENT-88491" />
              <Input label="Experience (Years)" value={experienceYears} onChangeText={setExperienceYears} placeholder="8" keyboardType="number-pad" />
              <Input label="Clinic Name" value={clinicName} onChangeText={setClinicName} placeholder="DentAI Super Speciality Clinic" />
              <Input label="Clinic Address" value={clinicAddress} onChangeText={setClinicAddress} placeholder="Nashik, Maharashtra" />
              <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Brief bio of clinical background..." multiline />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
              <Button title="Save Profile" onPress={handleSaveProfile} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: 6,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: colors.secondaryLight || colors.secondary,
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      borderRadius: 45,
    },
    avatarEmoji: {
      fontSize: 36,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    cameraIcon: {
      fontSize: 13,
    },
    tapHint: {
      fontSize: fonts.sizes.xs,
      color: colors.textMuted,
      marginBottom: 8,
    },
    name: {
      fontSize: fonts.sizes.xl,
      fontWeight: fonts.weights.bold,
      color: colors.textPrimary,
    },
    spec: {
      fontSize: fonts.sizes.sm,
      color: colors.secondary,
      fontWeight: 'bold',
      marginTop: 4,
    },
    clinic: {
      fontSize: fonts.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    card: {
      marginVertical: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: fonts.sizes.md,
      fontWeight: fonts.weights.bold,
      color: colors.textPrimary,
    },
    editBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.infoSoft,
    },
    editBtnText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '700',
      color: colors.primary,
    },
    info: {
      fontSize: fonts.sizes.sm,
      color: colors.textSecondary,
      marginVertical: 4,
    },
    logoutBtn: {
      backgroundColor: colors.danger,
      borderRadius: 12,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    logoutText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    modalCard: {
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 14,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
  });

export default Profile;
