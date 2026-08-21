import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { NotificationContext } from '../../context/NotificationContext';

export const Notifications = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const { notifications, markAllAsRead } = useContext(NotificationContext);

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        onBackPress={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Mark Read</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, !item.read && styles.unreadCard]}>
            <View style={styles.row}>
              <Text style={styles.icon}>{item.type === 'appointment' ? '📅' : '📄'}</Text>
              <View style={styles.textGroup}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
          </View>
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
  markReadText: {
    color: colors.primary,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  message: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
  },
});

export default Notifications;
