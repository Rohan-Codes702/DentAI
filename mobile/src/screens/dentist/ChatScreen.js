import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { ChatBubble } from '../../components/ChatBubble';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chatService';
import { chooseChatAttachment } from '../../utils/chatAttachments';

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

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

  const handlePickAttachment = async () => {
    if (!patientId || uploading) return;
    const file = await chooseChatAttachment();
    if (!file) return;
    setSelectedAttachment(file);
  };

  const handleSendAttachment = async () => {
    if (!patientId || !selectedAttachment || uploading) return;
    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await chatService.sendAttachment(patientId, selectedAttachment, (event) => {
        if (event.total) setUploadProgress(Math.round((event.loaded / event.total) * 100));
      });
      if (response?.message) setMessages((prev) => [...prev, response.message]);
      setSelectedAttachment(null);
      Alert.alert('Sent', 'Attachment sent successfully.');
    } catch (error) {
      Alert.alert('Upload failed', error.message || 'Unable to send attachment.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenAttachment = async (message) => {
    try {
      const url = await chatService.getAttachmentUrl(patientId, message._id);
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Unable to open file', error.message || 'The attachment is unavailable.');
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
            onOpenAttachment={handleOpenAttachment}
          />
        )}
      />}

      <View style={styles.inputBar}>
        {selectedAttachment && (
          <View style={styles.selectedAttachment}>
            <Text style={styles.selectedName} numberOfLines={1}>{selectedAttachment.name}</Text>
            <TouchableOpacity onPress={() => setSelectedAttachment(null)}>
              <Text style={styles.removeAttachment}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSendAttachment} disabled={uploading}>
              <Text style={styles.sendAttachment}>{uploading ? `${uploadProgress}%` : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickAttachment} disabled={uploading}>
          <Text style={styles.attachText}>{uploading ? `${uploadProgress}%` : 'Attach'}</Text>
        </TouchableOpacity>
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
  attachBtn: { width: 42, height: 44, justifyContent: 'center', alignItems: 'center' },
  attachText: { color: colors.secondary, fontSize: 11, fontWeight: '800' },
  selectedAttachment: {
    position: 'absolute',
    bottom: 68,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  selectedName: { flex: 1, color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  removeAttachment: { color: '#d32f2f', fontSize: 11, marginHorizontal: 8 },
  sendAttachment: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.textMuted,
  },
});

export default ChatScreen;
