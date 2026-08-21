import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { ShieldCheck, Sparkles, Stethoscope, UserRound, Mail, Lock, Fingerprint } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword } from '../../utils/validators';

export const LoginScreen = ({ navigation }) => {
  const { login, googleLogin, appleLogin } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(true);

  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(''); // 'Google' or 'Apple'
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthName, setOauthName] = useState('');

  const handleLogin = async () => {
    let errs = {};
    if (!validateEmail(email)) errs.email = 'Please enter a valid email address';
    if (!validatePassword(password)) errs.password = 'Password must be at least 6 characters';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Check your credentials', 'Please enter a valid email and password.');
      return;
    }

    setErrors({});
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      toast.error('Login failed', result.message || 'Invalid email or password');
      return;
    }

    toast.success('Welcome back', 'Authentication was successful.');
  };

  const handleGoogleLogin = () => {
    setOauthProvider('Google');
    setOauthEmail('');
    setOauthName('');
    setShowOAuthModal(true);
  };

  const handleAppleLogin = () => {
    setOauthProvider('Apple');
    setOauthEmail('');
    setOauthName('');
    setShowOAuthModal(true);
  };

  const submitOAuth = async () => {
    if (!validateEmail(oauthEmail)) {
      toast.error('Invalid Email', 'Please enter a valid email for OAuth.');
      return;
    }

    setShowOAuthModal(false);
    setLoading(true);

    let result;
    if (oauthProvider === 'Google') {
      result = await googleLogin({ token: 'mock-google-token', email: oauthEmail, name: oauthName || 'Google User' });
    } else {
      result = await appleLogin({ token: 'mock-apple-token', email: oauthEmail, name: oauthName || 'Apple User' });
    }

    setLoading(false);
    if (!result.success) {
      toast.error(`${oauthProvider} Login failed`, result.message || `Unable to connect to ${oauthProvider}`);
      return;
    }
    toast.success('Welcome back', `Logged in via ${oauthProvider}.`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />

      <View style={styles.heroBlock}>
        <View style={[styles.logoBadge, { backgroundColor: colors.glass, borderColor: colors.border }]}>
          <Stethoscope size={24} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>DentAI</Text>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your premium tele-dentistry workspace.</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.rolePill, { backgroundColor: colors.infoSoft }]}>
            <UserRound size={14} color={colors.primary} />
            <Text style={[styles.rolePillText, { color: colors.primary }]}>Patient</Text>
          </View>
          <View style={[styles.rolePill, { backgroundColor: colors.successSoft }]}>
            <ShieldCheck size={14} color={colors.success} />
            <Text style={[styles.rolePillText, { color: colors.success }]}>Dentist</Text>
          </View>
          <View style={[styles.rolePill, { backgroundColor: colors.warningSoft }]}>
            <Sparkles size={14} color={colors.warning} />
            <Text style={[styles.rolePillText, { color: colors.warning }]}>Admin</Text>
          </View>
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.glass, borderColor: colors.border }]}>
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleGoogleLogin}>
            <Text style={[styles.socialText, { color: colors.textPrimary }]}>G</Text>
            <Text style={[styles.socialLabel, { color: colors.textSecondary }]}>Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleAppleLogin}>
            <Text style={[styles.socialText, { color: colors.textPrimary }]}></Text>
            <Text style={[styles.socialLabel, { color: colors.textSecondary }]}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>or use your email</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. doctor@dentaicare.com"
          keyboardType="email-address"
          error={errors.email}
          icon={<Mail size={18} color={colors.textMuted} />}
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

        <View style={styles.metaRow}>
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe((prev) => !prev)}>
            <View style={[styles.checkbox, { backgroundColor: rememberMe ? colors.primary : 'transparent', borderColor: colors.primary }]}>
              {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={[styles.rememberText, { color: colors.textSecondary }]}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginBtn}
          icon={<Fingerprint size={18} color="#fff" />}
        />

        <Text style={[styles.helper, { color: colors.textSecondary }]}>Protected access with secure session handling and medical-grade privacy controls.</Text>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

      {/* Simulated OAuth Modal */}
      <Modal visible={showOAuthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Sign in with {oauthProvider}</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Enter details to simulate OAuth flow</Text>

            <Input
              label="Email Address"
              value={oauthEmail}
              onChangeText={setOauthEmail}
              placeholder="user@example.com"
              keyboardType="email-address"
            />
            <Input
              label="Full Name (Optional)"
              value={oauthName}
              onChangeText={setOauthName}
              placeholder="e.g. John Doe"
            />

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setShowOAuthModal(false)} style={styles.modalBtn} />
              <Button title="Continue" onPress={submitOAuth} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>

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
    opacity: 0.7,
  },
  heroBlock: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    marginBottom: 18,
  },
  logoBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
    maxWidth: 420,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 2,
  },
  socialRow: {
    gap: 10,
  },
  socialBtn: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialText: {
    width: 26,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '800',
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 10,
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
  },
});

export default LoginScreen;
