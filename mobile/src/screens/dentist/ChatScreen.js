import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { ChatBubble } from '../../components/ChatBubble';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chatService';

export const ChatScreen = ({ route }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const { user } = useAuth();
  const { socket } = useSocket();
  const patientId = route?.params?.patientId;
  const patientName = route?.params?.patientName || 'Rohan Mane';
  const patient = { _id: patientId, name: patientName };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(Boolean(patientId));

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    chatService.getMessages(patientId)
      .then((res) => setMessages(Array.isArray(res?.messages) ? res.messages : []))
      .catch((error) => Alert.alert('Chat error', error.message || 'Unable to load messages'))
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    if (!socket || !patientId) return;

    const handleNewMessage = (message) => {
      const senderId = message.sender?._id || message.sender;
      const receiverId = message.receiver?._id || message.receiver;
      if (senderId !== patientId && receiverId !== patientId) return;
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, patientId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!patientId || !text) return;
    setInputText('');

    try {
      if (socket?.connected) {
        socket.emit('sendMessage', { receiverId: patientId, text }, async (ack) => {
          if (ack?.success) return;
          if (ack?.success === false) {
            try {
              await chatService.sendMessage(patientId, { text });
            } catch (fallbackError) {
              setInputText(text);
              Alert.alert('Message failed', fallbackError.message || 'Unable to send message');
            }
          }
        });
      } else {
        await chatService.sendMessage(patientId, { text });
      }
    } catch (error) {
      setInputText(text);
      Alert.alert('Message failed', error.message || 'Unable to send message');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title={`Chat with ${patient.name}`} />

      {loading ? <Text style={styles.loadingText}>Loading messages...</Text> : <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isCurrentUser={(item.sender?._id || item.sender) === user?._id}
          />
        )}
      />}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Reply to patient..."
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.textMuted,
  },
});

export default ChatScreen;
