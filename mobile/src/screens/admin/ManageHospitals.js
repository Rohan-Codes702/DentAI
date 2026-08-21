import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export const ManageHospitals = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const hospitals = [
    { id: 'h1', name: 'DentAI Super Speciality Clinic', city: 'Nashik', address: 'College Road, Nashik', doctors: 4 },
    { id: 'h2', name: 'Smile Care Center', city: 'Nashik', address: 'MG Road, Nashik', doctors: 2 },
  ];

  return (
    <View style={styles.container}>
      <Header title="Manage Clinics & Hospitals" />

      <FlatList
        data={hospitals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.name}>🏥 {item.name}</Text>
            <Text style={styles.sub}>{item.address}</Text>
            <Text style={styles.doctors}>Assigned Dentists: {item.doctors}</Text>
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
  doctors: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default ManageHospitals;
