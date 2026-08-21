import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradient } from '../../theme/colors';
import { Bell, ChartColumn, ChevronRight, ScanFace, Users, Activity, CalendarCheck, Stethoscope } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { DiagnosisCard } from '../../components/DiagnosisCard';
import { SkeletonStack } from '../../components/Skeleton';
import { doctorService } from '../../services/doctorService';
import { useTheme } from '../../hooks/useTheme';
import { useSafeInsets } from '../../hooks/useSafeInsets';
import { getGreeting } from '../../utils/helpers';

export const Dashboard = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeInsets();

  const [stats, setStats] = useState({
    pendingReviews: 0,
    todayAppointments: 0,
    totalPatients: 0,
    totalXrays: 0,
  });
  const [pendingDiagnoses, setPendingDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, diagRes] = await Promise.all([
        doctorService.getStats().catch(() => null),
        doctorService.getDiagnoses('pending_review').catch(() => null),
      ]);

      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }
      if (diagRes?.diagnoses) {
        setPendingDiagnoses(diagRes.diagnoses);
      } else {
        setPendingDiagnoses([]);
      }
    } catch (e) {
      console.log('Error fetching dentist dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <LinearGradient colors={getGradient(theme.mode === 'dark')} style={styles.background} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>
            {getGreeting()}{user?.name ? `, Dr. ${user.name}` : ', Doctor'}
          </Text>
          <Text style={[styles.subgreeting, { color: colors.textSecondary }]}>
            Here's what's happening in your practice today
          </Text>
        </View>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Practice Overview</Text>
            <Text style={styles.heroTitle}>AI review queue and patient activity in real-time.</Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Stethoscope size={22} color="#fff" />
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{stats.pendingReviews}</Text>
            <Text style={styles.heroStatLabel}>Pending</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{stats.todayAppointments}</Text>
            <Text style={styles.heroStatLabel}>Today Appts</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{stats.totalPatients}</Text>
            <Text style={styles.heroStatLabel}>Patients</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          { label: 'Active Patients', value: stats.totalPatients, tone: colors.primary, icon: Users },
          { label: 'Pending Reviews', value: stats.pendingReviews, tone: colors.warning, icon: ScanFace },
          { label: 'Total AI Scans', value: stats.totalXrays, tone: colors.success, icon: Activity },
          { label: 'Today Appointments', value: stats.todayAppointments, tone: colors.secondary, icon: CalendarCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} style={styles.statCard} glass>
              <View style={[styles.statIconWrap, { backgroundColor: `${item.tone}14` }]}>
                <Icon size={18} color={item.tone} />
              </View>
              <Text style={[styles.statNum, { color: colors.textPrimary }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </Card>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.bannerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('UploadXray')}
      >
        <View style={[styles.bannerIconWrap, { backgroundColor: colors.infoSoft }]}>
          <ScanFace size={20} color={colors.primary} />
        </View>
        <View style={styles.bannerTextGroup}>
          <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Upload New Dental X-Ray</Text>
          <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
            Run AI diagnostic scan and start the review workflow.
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Diagnoses Pending Review ({pendingDiagnoses.length})
        </Text>
      </View>

      {loading ? (
        <Card style={styles.loadingCard} glass>
          <SkeletonStack lines={3} lastWidth="60%" />
        </Card>
      ) : pendingDiagnoses.length > 0 ? (
        pendingDiagnoses.map((diag, idx) => (
          <DiagnosisCard
            key={diag._id || idx}
            diagnosis={diag}
            onPress={() =>
              navigation.navigate('DiagnosisReview', {
                diagnosisId: diag._id,
                diagnosis: diag,
              })
            }
          />
        ))
      ) : (
        <EmptyState
          icon={ScanFace}
          title="No pending reviews"
          message="New scans will appear here as soon as the AI finishes analyzing them."
          compact
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  background: { ...StyleSheet.absoluteFillObject, opacity: 0.7 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800' },
  subgreeting: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  hero: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    gap: 16,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 },
  heroLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  heroTitle: { color: '#fff', fontSize: 20, lineHeight: 27, fontWeight: '800', marginTop: 6 },
  heroIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  heroStats: { flexDirection: 'row', gap: 10 },
  heroStatItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 12 },
  heroStatValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 4 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, minWidth: '46%', alignItems: 'flex-start' },
  statIconWrap: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  bannerCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 16, gap: 12 },
  bannerIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bannerTextGroup: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '800' },
  bannerSub: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  loadingCard: { marginBottom: 12 },
  diagCard: { marginVertical: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  diagCopy: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '800' },
  diagFindings: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  reviewBtn: { minHeight: 40, paddingHorizontal: 14, marginVertical: 0 },
  emptyCard: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySub: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

export default Dashboard;