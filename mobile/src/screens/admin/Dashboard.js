import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Admin Control Center"
        rightElement={
          <TouchableOpacity onPress={logout}>
            <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.num}>12</Text>
          <Text style={styles.label}>Doctors</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.num}>148</Text>
          <Text style={styles.label}>Patients</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.num}>6</Text>
          <Text style={styles.label}>Hospitals</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>System Management</Text>

      <Card style={styles.card} onPress={() => navigation.navigate('ManageDoctors')}>
        <Text style={styles.cardIcon}>👨‍⚕️</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Manage Doctors</Text>
          <Text style={styles.cardSub}>Verify dentist credentials & license numbers</Text>
        </View>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('ManagePatients')}>
        <Text style={styles.cardIcon}>😷</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Manage Patients</Text>
          <Text style={styles.cardSub}>View user registrations & profile data</Text>
        </View>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('ManageHospitals')}>
        <Text style={styles.cardIcon}>🏥</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Manage Hospitals & Clinics</Text>
          <Text style={styles.cardSub}>Register partner clinics and geolocation pins</Text>
        </View>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('Analytics')}>
        <Text style={styles.cardIcon}>📈</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>System Analytics & AI Metrics</Text>
          <Text style={styles.cardSub}>Monitor YOLOv8 model inference counts & accuracy</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statBox: {
    flex: 0.31,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  num: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.warning,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default Dashboard;
