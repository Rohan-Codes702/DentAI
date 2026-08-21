import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';

/**
 * Friendly, non-technical error surface. Pass the raw error to `logDetail`
 * only for console logging in dev — never render backend error text directly.
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = "We couldn't load this right now. Please try again.",
  onRetry,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
        <AlertTriangle size={26} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {!!onRetry && (
        <Button
          title="Try Again"
          variant="outline"
          onPress={onRetry}
          icon={<RefreshCw size={16} color={colors.primary} />}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  compact: {
    paddingVertical: 28,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 280,
  },
  button: {
    marginTop: 16,
    minWidth: 160,
  },
});

export default ErrorState;
