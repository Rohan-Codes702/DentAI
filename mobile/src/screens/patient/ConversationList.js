import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { MessageSquare, ChevronRight, UserCircle2 } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SkeletonStack } from '../../components/Skeleton';
import { chatService } from '../../services/chatService';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

export const ConversationList = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await chatService.getConversations();
      setConversations(Array.isArray(res?.conversations) ? res.conversations : []);
    } catch (e) {
      console.log('Failed to load conversations:', e);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const getOtherUser = (conv) => {
    const sender = conv.lastMessage?.sender;
    const receiver = conv.lastMessage?.receiver;
    if (sender && sender._id !== user?._id) return sender;
    if (receiver && receiver._id !== user?._id) return receiver;
    return { name: 'Dentist / Patient' };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Messages" subtitle="Chat with your care team" />

      <FlatList
        data={conversations}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          loading ? (
            <Card style={styles.loadingCard}>
              <SkeletonStack lines={3} lastWidth="70%" />
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const otherUser = getOtherUser(item);
          const lastMsgText = item.lastMessage?.text || (item.lastMessage?.attachment ? '📷 Attachment' : 'No messages yet');
          const dateStr = item.lastMessage?.createdAt
            ? new Date(item.lastMessage.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })
            : '';

          return (
            <TouchableOpacity
              style={[
                styles.convCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() =>
                navigation.navigate('ChatScreen', {
                  dentist: otherUser,
                  patient: otherUser,
                })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: colors.infoSoft }]}>
                {otherUser.avatar?.url ? (
                  <Image source={{ uri: otherUser.avatar.url }} style={styles.avatarImg} />
                ) : (
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {getInitials(otherUser.name)}
                  </Text>
                )}
              </View>

              <View style={styles.convContent}>
                <View style={styles.topRow}>
                  <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                    {otherUser.name || 'User'}
                  </Text>
                  <Text style={[styles.date, { color: colors.textMuted }]}>{dateStr}</Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={[styles.lastMsg, { color: colors.textSecondary }]} numberOfLines={1}>
                    {lastMsgText}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <MessageSquare size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Book an appointment or visit a doctor's profile to start chatting.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 40 },
  loadingCard: { marginBottom: 12 },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  convContent: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '800', flex: 1 },
  date: { fontSize: 11, marginLeft: 8 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  lastMsg: { fontSize: 13, flex: 1 },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default ConversationList;
