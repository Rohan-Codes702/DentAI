import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export const ManageDoctors = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const [doctors, setDoctors] = useState([
    { id: '1', name: 'Dr. Rohan Mane', clinic: 'DentAI Super Speciality Clinic', license: 'MH-88491', verified: true },
    { id: '2', name: 'Dr. Ananya Sharma', clinic: 'Smile Care Center', license: 'MH-99201', verified: false },
  ]);

  const toggleVerify = (id) => {
    setDoctors(
      doctors.map((d) => (d.id === id ? { ...d, verified: !d.verified } : d))
    );
    Alert.alert('Status Updated', 'Doctor verification status toggled successfully.');
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Doctors" />

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.clinic}</Text>
                <Text style={styles.license}>License: {item.license}</Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, item.verified ? styles.btnVerified : styles.btnUnverified]}
                onPress={() => toggleVerify(item.id)}
              >
                <Text style={styles.btnText}>{item.verified ? 'Verified ✓' : 'Approve'}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 20,
  },
  card: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  license: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnVerified: {
    backgroundColor: `${colors.success}25`,
  },
  btnUnverified: {
    backgroundColor: colors.warning,
  },
  btnText: {
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

export default ManageDoctors;
