import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Stethoscope,
  Building2,
  MapPin,
  MessageCircleMore,
  CalendarPlus2,
  Navigation,
  Clock,
  BadgeCheck,
  Phone,
  Mail,
  Award,
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import { formatClinicLocation, getClinicName, getInitials } from '../../utils/helpers';

export const DoctorDetail = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const doctor = route?.params?.doctor || route?.params?.dentist || null;
  const dp = doctor?.dentistProfile || {};
  const loc = dp.clinicLocation || doctor?.address || {};

  const handleGetDirections = () => {
    const lat = loc.coordinates?.lat;
    const lng = loc.coordinates?.lng;
    const addressStr = formatClinicLocation(doctor);

    let url = '';
    if (lat && lng) {
      if (Platform.OS === 'ios') {
        url = `maps://app?daddr=${lat},${lng}`;
      } else {
        url = `google.navigation:q=${lat},${lng}`;
      }
    } else if (addressStr) {
      const query = encodeURIComponent(addressStr);
      url = Platform.OS === 'ios' ? `maps://app?q=${query}` : `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else {
      Alert.alert('Location Unavailable', 'No coordinates or address found for this clinic.');
      return;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr || 'dental clinic')}`);
        }
      })
      .catch((e) => Alert.alert('Maps Error', e.message));
  };

  if (!doctor) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Doctor Profile" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>Doctor profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Doctor Profile" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Hero Card */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
          <View style={styles.avatarWrap}>
            {doctor.avatar?.url ? (
              <Image source={{ uri: doctor.avatar.url }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(doctor.name)}</Text>
            )}
          </View>

          <Text style={styles.heroName}>{doctor.name}</Text>
          <Text style={styles.heroSpec}>{dp.specialization || 'General Dentist'}</Text>

          {dp.experienceYears ? (
            <View style={styles.expBadge}>
              <Award size={13} color="#fff" />
              <Text style={styles.expText}>{dp.experienceYears} Years Experience</Text>
            </View>
          ) : null}

          {dp.isVerified && (
            <View style={styles.verifiedBadge}>
              <BadgeCheck size={14} color="#fff" />
              <Text style={styles.verifiedText}>Verified Dentist</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('BookAppointment', { dentistId: doctor._id, doctor })}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: `${colors.primary}18` }]}>
              <CalendarPlus2 size={20} color={colors.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Book Appt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ChatScreen', { dentist: doctor })}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: `${colors.secondary}18` }]}>
              <MessageCircleMore size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Start Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleGetDirections}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: `${colors.success}18` }]}>
              <Navigation size={20} color={colors.success} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Clinic & Location */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Practice Details</Text>
          <View style={styles.infoRow}>
            <Building2 size={16} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Clinic Name</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{getClinicName(doctor)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Location</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatClinicLocation(doctor)}</Text>
            </View>
          </View>

          {dp.licenseNumber ? (
            <View style={styles.infoRow}>
              <BadgeCheck size={16} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>License Number</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{dp.licenseNumber}</Text>
              </View>
            </View>
          ) : null}
        </Card>

        {/* Contact Info */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Contact Information</Text>
          {doctor.phone ? (
            <View style={styles.infoRow}>
              <Phone size={16} color={colors.primary} />
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{doctor.phone}</Text>
            </View>
          ) : null}
          {doctor.email ? (
            <View style={styles.infoRow}>
              <Mail size={16} color={colors.primary} />
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{doctor.email}</Text>
            </View>
          ) : null}
        </Card>

        {/* Bio */}
        {dp.bio ? (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>About Doctor</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{dp.bio}</Text>
          </Card>
        ) : null}

        {/* Primary CTA */}
        <Button
          title="Book Appointment Now"
          onPress={() => navigation.navigate('BookAppointment', { dentistId: doctor._id, doctor })}
          style={styles.bookBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  stateText: { fontSize: 16 },
  hero: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroSpec: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  expText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: 'rgba(34,197,94,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 12, fontWeight: '800' },
  card: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2, lineHeight: 20 },
  bioText: { fontSize: 14, lineHeight: 22 },
  bookBtn: { marginTop: 8 },
});

export default DoctorDetail;
