import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { validatePassword } from '../../utils/validators';

export const ResetPassword = ({ route, navigation }) => {
  const email = route?.params?.email || 'user@example.com';
  const { theme } = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!code || code.length < 4) {
      toast.error('Verification required', 'Please enter the 4-digit code sent to your email.');
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error('Weak password', 'New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password updated', 'Your account password was changed successfully.');
      navigation.navigate('Login');
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Set New Password" subtitle="Confirm identity and continue" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />
        <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.successSoft }]}>
            <LockKeyhole size={22} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Enter verification code</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>We have sent a verification code to {email}</Text>

          <Input
            label="4-Digit Code"
            value={code}
            onChangeText={setCode}
            placeholder="1234"
            keyboardType="number-pad"
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button title="Update Password" onPress={handleReset} loading={loading} style={styles.btn} icon={<ShieldCheck size={18} color="#fff" />} />
        </View>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  card: {
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 2,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  btn: {
    marginTop: 12,
  },
});

export default ResetPassword;
