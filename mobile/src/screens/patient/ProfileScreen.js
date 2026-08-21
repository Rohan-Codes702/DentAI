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

export const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const { user, logout, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleAvatarPress = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Ask user: choose from library or take photo
    Alert.alert(
      'Update Profile Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Photo Library',
          onPress: () => openLibrary(),
        },
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
      <Header title="Patient Profile" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          {/* Tappable avatar with camera overlay */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleAvatarPress}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              {user?.avatar?.url ? (
                <Image source={{ uri: user.avatar.url }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
                </Text>
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
          <Text style={styles.userName}>{user?.name || 'Patient Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'patient@email.com'}</Text>
          <Text style={styles.roleTag}>Role: Patient</Text>
        </View>

        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MedicalProfile')}
          >
            <Text style={styles.menuIcon}>🩺</Text>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>Medical Record &amp; Allergies</Text>
              <Text style={styles.menuSub}>Blood group, conditions &amp; emergency contacts</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>App Preferences &amp; Security</Text>
              <Text style={styles.menuSub}>Passwords, notifications &amp; preferences</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪 Log Out</Text>
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
    profileHeader: {
      alignItems: 'center',
      marginVertical: 16,
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: 6,
    },
    avatarCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.primaryLight,
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      borderRadius: 45,
    },
    avatarText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#fff',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
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
    userName: {
      fontSize: fonts.sizes.xl,
      fontWeight: fonts.weights.bold,
      color: colors.textPrimary,
    },
    userEmail: {
      fontSize: fonts.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    roleTag: {
      fontSize: fonts.sizes.xs,
      color: colors.primary,
      fontWeight: 'bold',
      marginTop: 6,
      textTransform: 'uppercase',
    },
    menuCard: {
      marginTop: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    menuIcon: {
      fontSize: 24,
      marginRight: 14,
    },
    menuTextGroup: {
      flex: 1,
    },
    menuTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: fonts.weights.bold,
      color: colors.textPrimary,
    },
    menuSub: {
      fontSize: fonts.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    arrow: {
      fontSize: 24,
      color: colors.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    logoutBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    logoutText: {
      color: colors.danger,
      fontSize: fonts.sizes.md,
      fontWeight: 'bold',
    },
  });

export default ProfileScreen;
