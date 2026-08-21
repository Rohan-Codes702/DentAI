import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { Bell, CalendarClock, ChevronRight, FileText, MapPinned, Bot, Sparkles, CalendarPlus2, Stethoscope, HeartPulse, MessageCircleMore, Activity } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/Card';
import { AppointmentCard } from '../../components/AppointmentCard';
import { SkeletonStack } from '../../components/Skeleton';
import { appointmentService } from '../../services/appointmentService';
import { getGreeting } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import { useSafeInsets } from '../../hooks/useSafeInsets';
import { useResponsive } from '../../utils/responsive';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeInsets();
  const { isSmallDevice } = useResponsive();
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const healthScore = 84;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments('confirmed');
      if (res?.appointments && res.appointments.length > 0) {
        setUpcomingAppointment(res.appointments[0]);
      }
    } catch (e) {
      console.log('Failed to fetch upcoming appt', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />

        <View style={styles.heroWrap}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
            <View style={styles.heroTopRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.greeting} numberOfLines={1}>{getGreeting()}, {user?.name || 'there'}</Text>
                <Text style={styles.subgreeting}>Keep your smile healthy with AI diagnostics</Text>
              </View>
              <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                <Bell size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroMetrics}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Health Score</Text>
                <Text style={styles.metricValue}>{healthScore}%</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${healthScore}%`, backgroundColor: '#22C55E' }]} />
                </View>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Today's status</Text>
                <Text style={styles.metricValue}>Stable</Text>
                <Text style={styles.metricSub}>No urgent symptoms detected</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick actions</Text>
        <View style={styles.grid}>
          {[
            { title: 'Nearby Clinics', desc: 'Map and filters', icon: MapPinned, action: 'NearbyDentists', tone: colors.primary },
            { title: 'AI Checker', desc: 'Symptom triage', icon: Bot, action: 'SymptomChecker', tone: colors.success },
            { title: 'Book Dentist', desc: 'Choose time slot', icon: CalendarPlus2, action: 'BookAppointment', tone: colors.secondary },
            { title: 'AI Reports', desc: 'X-ray analysis', icon: FileText, action: 'ReportsTab', tone: colors.warning },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.gridCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSmallDevice && styles.gridCardFull,
                ]}
                onPress={() => navigation.navigate(item.action)}
              >
                <View style={[styles.gridIconWrap, { backgroundColor: `${item.tone}14` }]}>
                  <Icon size={20} color={item.tone} />
                </View>
                <Text style={[styles.gridTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.gridDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Next appointment</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AppointmentsTab')}>
            <Text style={[styles.link, { color: colors.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Card style={styles.loadingCard} glass>
            <SkeletonStack lines={3} lastWidth="54%" />
          </Card>
        ) : upcomingAppointment ? (
          <AppointmentCard
            appointment={upcomingAppointment}
            onAction={() => navigation.navigate('AppointmentsTab')}
            userRole="patient"
          />
        ) : (
          <Card style={styles.emptyCard} glass>
            <CalendarClock size={32} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No upcoming appointments</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Book a consultation with certified dentists nearby.</Text>
            <TouchableOpacity style={[styles.bookNowBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('BookAppointment')}>
              <Text style={styles.bookNowText}>Book consultation</Text>
            </TouchableOpacity>
          </Card>
        )}

        <Card style={styles.tipCard} glass>
          <View style={styles.tipHead}>
            <Activity size={18} color={colors.primary} />
            <Text style={[styles.tipTag, { color: colors.primary }]}>Daily oral health tip</Text>
          </View>
          <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>Brushing technique matters</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>Brush twice a day for two minutes using a soft-bristled brush. Hold your brush at a 45-degree angle toward your gum line.</Text>
        </Card>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 22 }]}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <MessageCircleMore size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 96,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  heroWrap: {
    marginBottom: 18,
  },
  hero: {
    borderRadius: 28,
    padding: 18,
    gap: 14,
    shadowColor: 'rgba(15,23,42,0.15)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  subgreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  metricSub: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    marginTop: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48.5%',
    borderRadius: 22,
    padding: 14,
    marginBottom: 2,
    borderWidth: 1,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  gridCardFull: {
    width: '100%',
  },
  gridIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },
  gridDesc: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  bookNowBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 8,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  tipCard: {
    marginTop: 12,
    borderWidth: 1,
  },
  tipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTag: {
    fontSize: 12,
    fontWeight: '800',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  loadingCard: {
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(37,99,235,0.38)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
});

export default HomeScreen;
