import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { ReportCard } from '../../components/ReportCard';

export const Reports = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const dummyReports = [
    {
      _id: 'r1',
      createdAt: '2026-07-28',
      diagnosis: {
        status: 'confirmed',
        aiSummary: { conditionsFound: ['Caries (Tooth #14)', 'Periapical Lesion'] },
      },
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Generated Dental Reports" />
      <FlatList
        data={dummyReports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ReportCard report={item} />}
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
});

export default Reports;
