import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';
import { formatTime } from '../utils/helpers';

export const ChatBubble = ({ message, isCurrentUser, onOpenAttachment }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, isCurrentUser ? styles.sentContainer : styles.receivedContainer]}>
      <View style={[styles.bubble, isCurrentUser ? styles.sentBubble : styles.receivedBubble]}>
        {message.attachment?.type === 'pdf' && (
          <TouchableOpacity
            style={styles.pdfAttachment}
            onPress={() => onOpenAttachment?.(message)}
          >
            <Text style={styles.pdfIcon}>PDF</Text>
            <View style={styles.pdfInfo}>
              <Text style={[styles.pdfName, isCurrentUser ? styles.sentText : styles.receivedText]} numberOfLines={1}>
                {message.attachment.filename || 'Document.pdf'}
              </Text>
              <Text style={styles.pdfSize}>
                {message.attachment.size ? `${(message.attachment.size / 1024 / 1024).toFixed(2)} MB` : 'PDF document'} · Open
              </Text>
            </View>
          </TouchableOpacity>
        )}
        {message.attachment?.url && message.attachment.type !== 'pdf' && (
          <TouchableOpacity onPress={() => onOpenAttachment?.(message)}>
            <Image
              source={{ uri: message.attachment.downloadUrl || message.attachment.url }}
              style={styles.imageAttachment}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        {message.text && (
          <Text style={[styles.text, isCurrentUser ? styles.sentText : styles.receivedText]}>
            {message.text}
          </Text>
        )}
        <Text style={[styles.timeText, isCurrentUser ? styles.sentTime : styles.receivedTime]}>
          {formatTime(message.createdAt || new Date())}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
    flexDirection: 'row',
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sentBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2,
  },
  text: {
    fontSize: fonts.sizes.md,
    lineHeight: 20,
  },
  sentText: {
    color: '#ffffff',
  },
  receivedText: {
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: colors.textMuted,
  },
  imageAttachment: {
    width: 200,
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
  },
  pdfAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 190,
    marginBottom: 4,
  },
  pdfIcon: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    fontWeight: '800',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  pdfInfo: { flex: 1 },
  pdfName: { fontWeight: '700', maxWidth: 170 },
  pdfSize: { color: '#777', fontSize: 11, marginTop: 3 },
});
