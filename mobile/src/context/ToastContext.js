import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

export const ToastContext = createContext(null);

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

const ToastItem = ({ toast, onRemove }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 6 }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver: true }),
      ]).start(() => onRemove(toast.id));
    }, toast.duration || 3200);

    return () => clearTimeout(timer);
  }, [opacity, onRemove, toast.duration, toast.id, translateY]);

  const Icon = toastIcons[toast.type] || Info;
  const accent =
    toast.type === 'success'
      ? colors.success
      : toast.type === 'warning'
        ? colors.warning
        : toast.type === 'error'
          ? colors.danger
          : colors.primary;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.glass,
          borderColor: colors.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <Icon size={18} color={accent} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{toast.title}</Text>
        {!!toast.message && <Text style={[styles.message, { color: colors.textSecondary }]}>{toast.message}</Text>}
      </View>
    </Animated.View>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = 'info', duration = 3200 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, title, message, type, duration }]);
    return id;
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      success: (title, message, duration) => showToast({ title, message, type: 'success', duration }),
      error: (title, message, duration) => showToast({ title, message, type: 'error', duration }),
      warning: (title, message, duration) => showToast({ title, message, type: 'warning', duration }),
      info: (title, message, duration) => showToast({ title, message, type: 'info', duration }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <View style={[styles.layer, { pointerEvents: 'box-none' }]}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  layer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 999,
    gap: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: 'rgba(15,23,42,0.14)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
});