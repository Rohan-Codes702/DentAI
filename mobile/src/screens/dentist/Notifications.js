import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Bell, CalendarCheck, ScanLine } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export const Notifications = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const notifs = [
    {
      id: '1',
      title: 'New Appointment Booking',
      message: 'A patient has booked a consultation slot for tomorrow.',
      date: '15m ago',
      icon: CalendarCheck,
      tone: colors.primary,
    },
    {
      id: '2',
      title: 'AI Analysis Complete',
      message: 'Uploaded panoramic scan has been processed by the clinical AI model and is ready for your review.',
      date: '1h ago',
      icon: ScanLine,
      tone: colors.success,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Notifications & Alerts" showBack onBackPress={() => navigation.goBack()} />
      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.tone}18` }]}>
                  <Icon size={20} color={item.tone} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.msg, { color: colors.textSecondary }]}>{item.message}</Text>
                  <Text style={[styles.date, { color: colors.textMuted }]}>{item.date}</Text>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800' },
  msg: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  date: { fontSize: 11, marginTop: 6 },
});

export default Notifications;
