import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, MapPin, BadgeCheck } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Button } from './Button';

export const DentistCard = ({ dentist, onPress, onBook }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const profile = dentist?.dentistProfile || {};
  const name = dentist?.name ? `Dr. ${dentist.name}` : 'Dr. Dentist';
  const specialization = profile.specialization || 'General Dentistry';
  const clinic = profile.clinicName || dentist?.clinic || 'DentAI Partner Clinic';
  const rating = profile.rating ?? dentist?.rating ?? 4.8;
  const distance = dentist?.distanceKm != null ? `${dentist.distanceKm.toFixed(1)} km away` : profile.location || 'Nearby';
  const isAvailable = profile.available !== false;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Avatar uri={dentist?.avatar?.url || dentist?.profileImage} name={dentist?.name} size={56} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
            <BadgeCheck size={15} color={colors.primary} />
          </View>
          <Text style={[styles.specialization, { color: colors.textSecondary }]} numberOfLines={1}>{specialization}</Text>
          <View style={styles.metaRow}>
            <Star size={13} color={colors.warning} fill={colors.warning} />
            <Text style={[styles.metaText, { color: colors.textPrimary }]}>{Number(rating).toFixed(1)}</Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <MapPin size={13} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{distance}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footerRow}>
        <Text style={[styles.clinic, { color: colors.textSecondary }]} numberOfLines={1}>{clinic}</Text>
        <View style={styles.footerRight}>
          <View
            style={[
              styles.availabilityPill,
              { backgroundColor: isAvailable ? colors.successSoft : colors.dangerSoft },
            ]}
          >
            <Text style={[styles.availabilityText, { color: isAvailable ? colors.success : colors.danger }]}>
              {isAvailable ? 'Available Today' : 'Fully Booked'}
            </Text>
          </View>
        </View>
      </View>

      {!!onBook && (
        <Button title="Book Appointment" onPress={onBook} style={styles.bookBtn} />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '800', flexShrink: 1 },
  specialization: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, flexWrap: 'wrap' },
  metaText: { fontSize: 12, fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 2, marginHorizontal: 3 },
  divider: { height: 1, marginVertical: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  footerRight: { flexShrink: 0 },
  clinic: { fontSize: 12, flex: 1, fontWeight: '500' },
  availabilityPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  availabilityText: { fontSize: 11, fontWeight: '800' },
  bookBtn: { marginTop: 12, marginVertical: 0 },
});

export default DentistCard;
