import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export const ManagePatients = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const patients = [
    { id: '1', name: 'Rohan Mane', email: 'rohan@test.com', phone: '9876543210', joined: '2026-07-28' },
    { id: '2', name: 'Amit Patel', email: 'amit@test.com', phone: '9876500000', joined: '2026-07-20' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Manage Patients" />

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>Email: {item.email} • Phone: {item.phone}</Text>
            <Text style={styles.date}>Registered: {item.joined}</Text>
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
  date: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
});

export default ManagePatients;
