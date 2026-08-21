import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
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
  const { register, sendOtp } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(ROLES.PATIENT);
  const [otpCode, setOtpCode] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.warning('Photo access required', 'Grant gallery access to upload a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
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

      setLoading(true);
      const result = await sendOtp(email);
      setLoading(false);

      if (result.success) {
        toast.success('OTP Sent', 'Check your email for the verification code.');
        setStep(3);
      } else {
        toast.error('Failed to send OTP', result.message || 'Please try again.');
      }
    }
  };

  const handleRegister = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error('Verification Required', 'Please enter the 4-digit OTP.');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, role, phone, otp: otpCode });
    setLoading(false);

    if (!result.success) {
      toast.error('Registration failed', result.message || 'Error creating account');
      return;
    }

    toast.success('Account created', 'Your DentAI profile is ready to use.');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />

      <View style={styles.headerBox}>
        <View style={[styles.badge, { backgroundColor: colors.glass, borderColor: colors.border }]}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Premium onboarding</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Register as a patient or dentist and finish profile verification in minutes.</Text>
      </View>

      <View style={styles.stepper}>
        {[1, 2, 3].map((item) => (
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
            <Text style={[styles.profileTitle, { color: colors.textPrimary }]}>Profile image upload</Text>
            <Text style={[styles.profileText, { color: colors.textSecondary }]}>Add a professional photo for clinics, chat, and booking confirmation screens.</Text>
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

            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={[styles.strengthBar, { backgroundColor: strength >= item ? colors.primary : colors.surfaceLight }]} />
              ))}
            </View>
            <Text style={[styles.strengthCopy, { color: colors.textSecondary }]}>Password strength improves with upper case, numbers, and symbols.</Text>
          </>
        )}

        {step >= 3 && (
          <View style={styles.otpCard}>
            <Text style={[styles.otpTitle, { color: colors.textPrimary }]}>OTP verification</Text>
            <Text style={[styles.otpText, { color: colors.textSecondary }]}>Enter the 4-digit code sent to your email or phone to activate secure access.</Text>
            <Input
              label="Verification Code"
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="1234"
              keyboardType="number-pad"
            />
          </View>
        )}

        <View style={styles.stepActions}>
          {step > 1 ? (
            <Button title="Back" variant="outline" onPress={() => setStep((current) => current - 1)} style={styles.stepBtn} />
          ) : (
            <View style={styles.stepBtn} />
          )}

          {step < 3 ? (
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
    color: '#64748B',
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
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 8,
  },
  roleBtnActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
  },
  roleText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
  },
  roleTextActive: {
    color: '#0EA5E9',
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
  otpCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  otpTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  otpText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 10,
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
    color: '#64748B',
    fontSize: 13,
  },
  loginLink: {
    fontWeight: '800',
    fontSize: 13,
  },
});

export default RegisterScreen;
