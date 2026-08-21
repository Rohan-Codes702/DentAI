import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export const Profile = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const { user, logout, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);

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

    Alert.alert(
      'Update Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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

  return (
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
          <Text style={styles.name}>{user?.name || 'Dr. Rohan Mane'}</Text>
          <Text style={styles.spec}>Orthodontics &amp; Dental Surgery</Text>
          <Text style={styles.clinic}>DentAI Super Speciality Clinic • Nashik</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>Practice Info</Text>
          <Text style={styles.info}>License No: MH-DENT-88491</Text>
          <Text style={styles.info}>Experience: 8 Years</Text>
          <Text style={styles.info}>Verification Status: Verified ✓</Text>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    },
    card: {
      marginVertical: 12,
    },
    title: {
      fontSize: fonts.sizes.md,
      fontWeight: fonts.weights.bold,
      color: colors.textPrimary,
      marginBottom: 8,
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
  });

export default Profile;
