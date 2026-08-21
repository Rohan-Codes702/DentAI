import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Send, Phone, Video } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { ChatBubble } from '../../components/ChatBubble';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { chatService } from '../../services/chatService';
import { getInitials } from '../../utils/helpers';

export const ChatScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const { colors } = theme;

  const targetUser = route?.params?.dentist || route?.params?.patient || route?.params?.user || null;
  const targetUserId = targetUser?._id || targetUser?.id || route?.params?.targetUserId || null;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [targetUserId]);

  const fetchMessages = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await chatService.getMessages(targetUserId);
      setMessages(Array.isArray(res?.messages) ? res.messages : []);
    } catch (error) {
      console.log('Error loading chat history:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !targetUserId) return;

    const handleNewMessage = (msg) => {
      // Only add message if it's part of this conversation
      const msgSenderId = msg.sender?._id || msg.sender;
      const msgReceiverId = msg.receiver?._id || msg.receiver;
      const isRelevant =
        msgSenderId === targetUserId ||
        msgReceiverId === targetUserId ||
        msgSenderId === user?._id ||
        msgReceiverId === user?._id;

      if (isRelevant) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleTyping = ({ userId: typingUserId }) => {
      if (typingUserId === targetUserId) setIsTyping(true);
    };

    const handleStopTyping = ({ userId: typingUserId }) => {
      if (typingUserId === targetUserId) setIsTyping(false);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, targetUserId, user?._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleTypingEmit = (text) => {
    setInputText(text);
    if (!socket || !targetUserId) return;

    socket.emit('typing', { receiverId: targetUserId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: targetUserId });
    }, 1500);
  };

  const handleSend = async () => {
    if (!targetUserId) return;
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    if (socket) socket.emit('stopTyping', { receiverId: targetUserId });

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      sender: { _id: user?._id, name: user?.name },
      receiver: { _id: targetUserId },
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      if (socket?.connected) {
        socket.emit('sendMessage', { receiverId: targetUserId, text }, (ack) => {
          if (ack?.success && ack?.message) {
            // Replace optimistic message with server-confirmed message
            setMessages((prev) =>
              prev.map((m) => (m._id === tempId ? ack.message : m))
            );
          }
        });
      } else {
        const res = await chatService.sendMessage(targetUserId, { text });
        if (res?.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? res.message : m))
          );
        }
      }
    } catch (error) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      Alert.alert('Message failed', error.message || 'Unable to send message');
    }
  };

  const isCurrentUser = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId === user?._id;
  };

  if (!targetUserId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Chat"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.emptyChat}>
          <Text style={[styles.emptyChatIcon]}>💬</Text>
          <Text style={[styles.emptyChatTitle, { color: colors.textPrimary }]}>
            No conversation selected
          </Text>
          <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
            Start a conversation from the doctor's profile or your appointments.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      {/* Header */}
      <View style={[styles.chatHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={[styles.headerAvatar, { backgroundColor: colors.infoSoft }]}>
          {targetUser?.avatar?.url ? (
            <Image source={{ uri: targetUser.avatar.url }} style={styles.headerAvatarImg} />
          ) : (
            <Text style={[styles.headerAvatarText, { color: colors.primary }]}>
              {getInitials(targetUser?.name)}
            </Text>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.textPrimary }]} numberOfLines={1}>
            {targetUser?.name || 'Chat'}
          </Text>
          <Text style={[styles.headerStatus, { color: isTyping ? colors.success : colors.textMuted }]}>
            {isTyping ? 'Typing...' : 'Online'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyMessages}>
          <Text style={styles.emptyMsgIcon}>💬</Text>
          <Text style={[styles.emptyMsgTitle, { color: colors.textPrimary }]}>Start the conversation</Text>
          <Text style={[styles.emptyMsgSub, { color: colors.textSecondary }]}>
            Send a message to {targetUser?.name || 'the doctor'} to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id?.toString()}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <ChatBubble message={item} isCurrentUser={isCurrentUser(item)} />
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={inputText}
          onChangeText={handleTypingEmit}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceLight },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={18} color={inputText.trim() ? '#fff' : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImg: { width: '100%', height: '100%' },
  headerAvatarText: { fontSize: 15, fontWeight: '800' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '800' },
  headerStatus: { fontSize: 12, marginTop: 1 },
  messageList: { padding: 16, paddingBottom: 8 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyChatIcon: { fontSize: 48 },
  emptyChatTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyChatText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14 },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 10,
  },
  emptyMsgIcon: { fontSize: 40 },
  emptyMsgTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyMsgSub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});

export default ChatScreen;
