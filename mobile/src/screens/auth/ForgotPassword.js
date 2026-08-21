import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { MailCheck, ShieldCheck } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { validateEmail } from '../../utils/validators';

export const ForgotPassword = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = () => {
    if (!validateEmail(email)) {
      toast.error('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Reset link sent', 'Password reset instructions were emailed to your address.');
      navigation.navigate('ResetPassword', { email });
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Forgot Password" subtitle="Secure account recovery" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />
        <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.infoSoft }]}>
            <MailCheck size={22} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reset your password</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>Enter your registered email address and we will send a secure reset link.</Text>

          <Input
            label="Registered Email"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. user@example.com"
            keyboardType="email-address"
          />

          <Button title="Send Reset Instructions" onPress={handleSendReset} loading={loading} style={styles.btn} icon={<ShieldCheck size={18} color="#fff" />} />
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

export default ForgotPassword;
