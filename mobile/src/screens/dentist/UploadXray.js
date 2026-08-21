import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine, Upload, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { doctorService } from '../../services/doctorService';
import { useTheme } from '../../hooks/useTheme';
import { getInitials } from '../../utils/helpers';

export const UploadXray = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [imageUri, setImageUri] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [imageFileName, setImageFileName] = useState('xray.jpg');
  const [loading, setLoading] = useState(false);

  const patientId = route?.params?.patientId;
  const patientName = route?.params?.patientName;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access gallery is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType?.Images || 'images',
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageFile(asset.file || null);
      setImageBase64(asset.base64 || null);
      setImageMimeType(asset.mimeType || 'image/jpeg');
      setImageFileName(asset.fileName || 'xray.jpg');
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) {
      Alert.alert('Selection Required', 'Please select a dental X-ray image');
      return;
    }

    if (!patientId) {
      Alert.alert('Missing Patient', 'Select a patient before uploading an X-ray.');
      return;
    }

    setLoading(true);
    try {
      let payload = null;

      if (Platform.OS === 'web' && imageFile) {
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('xray', imageFile, imageFile.name || imageFileName);
        payload = formData;
      } else if (Platform.OS === 'web') {
        if (!imageBase64) {
          throw new Error(
            'Unable to read the selected image in the browser. Please choose a different image.'
          );
        }
        payload = {
          patientId,
          xrayDataUri: `data:${imageMimeType};base64,${imageBase64}`,
          xrayFileName: imageFileName,
          xrayMimeType: imageMimeType,
        };
      } else {
        // Native (Android / iOS)
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('xray', {
          uri: imageUri,
          name: imageFileName,
          type: imageMimeType,
        });
        payload = formData;
      }

      const res = await doctorService.uploadXrayAndDiagnose(payload);

      if (res?.diagnosis) {
        Alert.alert(
          '🤖 AI Analysis Complete',
          'The AI screening system successfully analyzed the X-ray. Please review the findings and add your clinical notes.',
          [
            {
              text: 'Review Now',
              onPress: () =>
                navigation.navigate('DiagnosisReview', {
                  diagnosis: res.diagnosis,
                  diagnosisId: res.diagnosis?._id,
                }),
            },
          ]
        );
      } else {
        Alert.alert('Upload Complete', 'X-ray was uploaded, but no diagnosis payload was returned.');
      }
    } catch (e) {
      Alert.alert('AI Analysis Failed', e.message || 'Unable to analyze the uploaded X-ray.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Upload Dental X-Ray"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Banner */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <ScanLine size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>AI Dental Screening</Text>
          <Text style={styles.heroSub}>
            Upload a panoramic or bitewing X-ray for instant clinical AI analysis
          </Text>
        </LinearGradient>

        {/* Patient indicator */}
        {patientName ? (
          <Card style={styles.patientBanner}>
            <View style={[styles.patientAvatarSmall, { backgroundColor: colors.infoSoft }]}>
              <Text style={[styles.patientInitials, { color: colors.primary }]}>
                {getInitials(patientName)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.patientLabel, { color: colors.textMuted }]}>Patient</Text>
              <Text style={[styles.patientName, { color: colors.textPrimary }]}>{patientName}</Text>
            </View>
            <CheckCircle2 size={18} color={colors.success} />
          </Card>
        ) : (
          <Card style={[styles.patientBanner, { borderColor: colors.warning }]}>
            <AlertCircle size={18} color={colors.warning} />
            <Text style={[styles.noPatientText, { color: colors.warning }]}>
              No patient selected. Please go back and select a patient from your list.
            </Text>
          </Card>
        )}

        {/* Upload area */}
        <TouchableOpacity
          style={[
            styles.uploadArea,
            {
              backgroundColor: colors.surface,
              borderColor: imageUri ? colors.primary : colors.border,
            },
          ]}
          onPress={pickImage}
          activeOpacity={0.85}
        >
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
              <View style={[styles.changeOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <Upload size={18} color="#fff" />
                <Text style={styles.changeText}>Tap to change</Text>
              </View>
            </>
          ) : (
            <View style={styles.placeholderBox}>
              <View style={[styles.uploadIconWrap, { backgroundColor: colors.infoSoft }]}>
                <Upload size={24} color={colors.primary} />
              </View>
              <Text style={[styles.uploadText, { color: colors.textPrimary }]}>
                Tap to select X-ray
              </Text>
              <Text style={[styles.uploadSub, { color: colors.textMuted }]}>
                JPG, PNG formats supported
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
            How AI analysis works
          </Text>
          {[
            '1. X-ray is securely encrypted and uploaded',
            '2. Clinical AI model detects potential dental conditions',
            '3. High-confidence findings are highlighted for review',
            '4. You review, add clinical notes, and confirm the report',
          ].map((step, i) => (
            <Text key={i} style={[styles.infoStep, { color: colors.textSecondary }]}>
              {step}
            </Text>
          ))}
          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            ⚠️ AI analysis is a preliminary decision support tool. Dentist review is mandatory before any report is issued.
          </Text>
        </Card>

        <Button
          title={loading ? 'Analyzing X-Ray...' : 'Run AI Diagnostics'}
          onPress={handleAnalyze}
          loading={loading}
          style={styles.btn}
          disabled={!imageUri || !patientId}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  hero: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 19,
  },
  patientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  patientAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInitials: { fontSize: 14, fontWeight: '800' },
  patientLabel: { fontSize: 11, fontWeight: '700' },
  patientName: { fontSize: 14, fontWeight: '800' },
  noPatientText: { fontSize: 13, fontWeight: '600', flex: 1 },
  uploadArea: {
    height: 240,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  previewImage: { width: '100%', height: '100%' },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  placeholderBox: { alignItems: 'center', gap: 10 },
  uploadIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: { fontSize: 15, fontWeight: '800' },
  uploadSub: { fontSize: 12 },
  infoCard: { marginBottom: 16, gap: 6 },
  infoTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  infoStep: { fontSize: 13, lineHeight: 19 },
  disclaimer: { fontSize: 11, lineHeight: 16, marginTop: 8, fontStyle: 'italic' },
  btn: { marginTop: 4 },
});

export default UploadXray;
