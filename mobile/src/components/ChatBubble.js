import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/fonts';
import { formatTime } from '../utils/helpers';

export const ChatBubble = ({ message, isCurrentUser }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, isCurrentUser ? styles.sentContainer : styles.receivedContainer]}>
      <View style={[styles.bubble, isCurrentUser ? styles.sentBubble : styles.receivedBubble]}>
        {message.attachment?.url && (
          <Image source={{ uri: message.attachment.url }} style={styles.imageAttachment} resizeMode="cover" />
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
});
