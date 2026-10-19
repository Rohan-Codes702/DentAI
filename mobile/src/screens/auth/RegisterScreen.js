import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { Upload, ShieldCheck, Sparkles, UserRound, Mail, Lock, Phone, IdCard, UserCog } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validators';
import { ROLES } from '../../utils/constants';

export const RegisterScreen = ({ navigation }) => {
  const { register, updateAvatar } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(ROLES.PATIENT);
  const [profileImage, setProfileImage] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic Dentist fields
  const [specialization, setSpecialization] = useState('General Dentistry');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [bio, setBio] = useState('');

  // Dynamic Patient fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('male');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const pickProfileImage = async () => {
    Alert.alert('Select Profile Photo', 'Choose an option to add your photo', [
      {
        text: 'Take Photo with Camera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            toast.warning('Camera access required', 'Grant camera access to take a profile photo.');
            return;
          }
          const res = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!res.canceled && res.assets?.[0]?.uri) {
            setProfileImage(res.assets[0].uri);
          }
        },
      },
      {
        text: 'Choose from Photo Library',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            toast.warning('Photo access required', 'Grant gallery access to upload a profile image.');
            return;
          }
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!res.canceled && res.assets?.[0]?.uri) {
            setProfileImage(res.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Required Field', 'Please enter your full name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      let errs = {};
      if (!validateEmail(email)) errs.email = 'Valid email is required';
      if (!validatePassword(password)) errs.password = 'Password must be at least 6 characters';
      if (phone && !validatePhone(phone)) errs.phone = 'Invalid phone number format';

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        toast.error('Please complete the form', 'Review the highlighted fields and try again.');
        return;
      }
      setErrors({});

      await handleRegister();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const registerPayload = {
      name,
      email,
      password,
      role,
      phone,
    };

    if (role === ROLES.DENTIST) {
      registerPayload.specialization = specialization;
      registerPayload.licenseNumber = licenseNumber;
      registerPayload.experienceYears = experienceYears;
      registerPayload.clinicName = clinicName;
      registerPayload.clinicAddress = clinicAddress;
      registerPayload.bio = bio;
    } else if (role === ROLES.PATIENT) {
      registerPayload.dateOfBirth = dateOfBirth;
      registerPayload.gender = gender;
      registerPayload.address = { street, city, state: stateName, zip };
      registerPayload.medicalProfile = {
        bloodGroup,
        allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
        medicalHistory: medicalHistory ? medicalHistory.split(',').map((s) => s.trim()) : [],
        currentMedications: currentMedications ? currentMedications.split(',').map((s) => s.trim()) : [],
        emergencyContact: {
          name: emergencyContactName,
          phone: emergencyContactPhone,
        },
      };
    }

    const result = await register(registerPayload);

    if (!result.success) {
      setLoading(false);
      toast.error('Registration failed', result.message || 'Error creating account');
      return;
    }

    // Upload profile picture if one was picked during registration
    if (profileImage) {
      try {
        await updateAvatar(profileImage);
      } catch (imgErr) {
        console.log('Avatar upload during registration warning:', imgErr);
      }
    }

    setLoading(false);
    toast.success('Account created', 'Your DentAI profile is ready to use.');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />

      <View style={styles.headerBox}>
        <View style={[styles.badge, { backgroundColor: colors.glass, borderColor: colors.border }]}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Welcome to DentAI</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join as a patient or dentist to access personalized dental care in minutes.</Text>
      </View>

      <View style={styles.stepper}>
        {[1, 2].map((item) => (
          <View key={item} style={[styles.stepDot, { backgroundColor: step >= item ? colors.primary : colors.surfaceLight }]}>
            <Text style={styles.stepDotText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.glass, borderColor: colors.border }]}>
        <Text style={styles.roleLabel}>I am registering as a:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === ROLES.PATIENT && styles.roleBtnActive]}
            onPress={() => setRole(ROLES.PATIENT)}
          >
            <UserRound size={14} color={role === ROLES.PATIENT ? colors.primary : colors.textSecondary} />
            <Text style={[styles.roleText, role === ROLES.PATIENT && styles.roleTextActive]}>Patient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === ROLES.DENTIST && styles.roleBtnActive]}
            onPress={() => setRole(ROLES.DENTIST)}
          >
            <ShieldCheck size={14} color={role === ROLES.DENTIST ? colors.primary : colors.textSecondary} />
            <Text style={[styles.roleText, role === ROLES.DENTIST && styles.roleTextActive]}>Dentist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === ROLES.ADMIN && styles.roleBtnActive]}
            onPress={() => setRole(ROLES.ADMIN)}
          >
            <UserCog size={14} color={role === ROLES.ADMIN ? colors.primary : colors.textSecondary} />
            <Text style={[styles.roleText, role === ROLES.ADMIN && styles.roleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <TouchableOpacity style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickProfileImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileFallback, { backgroundColor: colors.infoSoft }]}>
                <Upload size={18} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileTitle, { color: colors.textPrimary }]}>Profile photo</Text>
            <Text style={[styles.profileText, { color: colors.textSecondary }]}>Add a photo to help identify your profile on appointments and reports.</Text>
          </View>
        </View>

        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Rohan Mane"
          error={errors.name}
          icon={<IdCard size={18} color={colors.textMuted} />}
        />

        {step >= 2 && (
          <>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rohan@test.com"
              keyboardType="email-address"
              error={errors.email}
              icon={<Mail size={18} color={colors.textMuted} />}
            />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              error={errors.phone}
              icon={<Phone size={18} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
              icon={<Lock size={18} color={colors.textMuted} />}
            />

            {/* Role-Specific Practice / Medical Form Fields */}
            {role === ROLES.DENTIST ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>
                  Dental Practice Info
                </Text>
                <Input
                  label="Specialization"
                  value={specialization}
                  onChangeText={setSpecialization}
                  placeholder="e.g. Orthodontics, General Dentistry"
                />
                <Input
                  label="Medical License Number"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  placeholder="e.g. MH-DENT-88491"
                />
                <Input
                  label="Years of Experience"
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  placeholder="e.g. 8"
                  keyboardType="number-pad"
                />
                <Input
                  label="Clinic Name"
                  value={clinicName}
                  onChangeText={setClinicName}
                  placeholder="e.g. DentAI Super Speciality Clinic"
                />
                <Input
                  label="Clinic Address"
                  value={clinicAddress}
                  onChangeText={setClinicAddress}
                  placeholder="e.g. Nashik, Maharashtra"
                />
                <Input
                  label="About your Practice"
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Brief summary of your clinical background..."
                  multiline
                />
              </View>
            ) : role === ROLES.PATIENT ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>
                  Personal Health Details
                </Text>
                <Input
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="e.g. 1995-08-15"
                />
                <Input
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Nashik"
                />
                <Input
                  label="Street Address"
                  value={street}
                  onChangeText={setStreet}
                  placeholder="e.g. Main Street"
                />
                <Input
                  label="State"
                  value={stateName}
                  onChangeText={setStateName}
                  placeholder="e.g. Maharashtra"
                />
                <Input
                  label="Blood Group"
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  placeholder="e.g. O+, A+, B-"
                />
                <Input
                  label="Known Allergies"
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="e.g. Penicillin, Latex"
                />
                <Input
                  label="Medical Conditions"
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                  placeholder="e.g. Diabetes, Asthma"
                />
                <Input
                  label="Current Medications"
                  value={currentMedications}
                  onChangeText={setCurrentMedications}
                  placeholder="e.g. Aspirin, Metformin"
                />
                <Input
                  label="Emergency Contact Name"
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                  placeholder="e.g. Family member or friend"
                />
                <Input
                  label="Emergency Contact Phone"
                  value={emergencyContactPhone}
                  onChangeText={setEmergencyContactPhone}
                  placeholder="e.g. 9876543210"
                  keyboardType="phone-pad"
                />
              </View>
            ) : null}

            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={[styles.strengthBar, { backgroundColor: strength >= item ? colors.primary : colors.surfaceLight }]} />
              ))}
            </View>
            <Text style={[styles.strengthCopy, { color: colors.textSecondary }]}>Tip: Combine letters and numbers for a strong password.</Text>
          </>
        )}

        <View style={styles.stepActions}>
          {step > 1 ? (
            <Button title="Back" variant="outline" onPress={() => setStep((current) => current - 1)} style={styles.stepBtn} />
          ) : (
            <View style={styles.stepBtn} />
          )}

          {step < 2 ? (
            <Button title="Continue" onPress={handleContinue} loading={loading} style={styles.stepBtn} />
          ) : (
            <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.stepBtn} />
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.68,
  },
  headerBox: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 520,
  },
  formCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 2,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#52706D',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8EAE6',
    flexDirection: 'row',
    gap: 8,
  },
  roleBtnActive: {
    backgroundColor: '#EAF7F4',
    borderColor: '#2A9D8F',
  },
  roleText: {
    color: '#52706D',
    fontSize: 13,
    fontWeight: '800',
  },
  roleTextActive: {
    color: '#0F766E',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    marginTop: 4,
  },
  profileCard: {
    width: 82,
    height: 82,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  profileText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  strengthRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  strengthBar: {
    flex: 1,
    height: 8,
    borderRadius: 999,
  },
  strengthCopy: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 14,
  },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  stepBtn: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  footerText: {
    color: '#52706D',
    fontSize: 13,
  },
  loginLink: {
    fontWeight: '800',
    fontSize: 13,
  },
});

export default RegisterScreen;
