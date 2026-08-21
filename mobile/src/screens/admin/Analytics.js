import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export const Analytics = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="AI Performance Analytics" />

      <Card style={styles.metricCard}>
        <Text style={styles.metricTitle}>YOLOv8 Diagnostic Precision</Text>
        <Text style={styles.metricBig}>94.2%</Text>
        <Text style={styles.metricSub}>mAP@0.5 score on dental X-ray validation set</Text>
      </Card>

      <Card style={styles.metricCard}>
        <Text style={styles.metricTitle}>Total Inference Scans Executed</Text>
        <Text style={styles.metricBig}>1,248</Text>
        <Text style={styles.metricSub}>Average processing latency: 1.4 seconds</Text>
      </Card>

      <Card style={styles.metricCard}>
        <Text style={styles.metricTitle}>Most Frequently Detected Conditions</Text>
        <Text style={styles.item}>1. Dental Caries (Class 0): 54%</Text>
        <Text style={styles.item}>2. Gingivitis (Class 1): 22%</Text>
        <Text style={styles.item}>3. Periapical Lesions (Class 2): 14%</Text>
        <Text style={styles.item}>4. Impacted Teeth (Class 3): 10%</Text>
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
  metricCard: {
    marginVertical: 8,
  },
  metricTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.textSecondary,
  },
  metricBig: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.warning,
    marginVertical: 6,
  },
  metricSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
  },
  item: {
    fontSize: fonts.sizes.xs,
    color: colors.textPrimary,
    marginTop: 6,
  },
});

export default Analytics;
