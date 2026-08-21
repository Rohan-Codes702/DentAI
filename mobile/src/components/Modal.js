import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * variant="center"  -> centered dialog (confirmations, small forms)
 * variant="sheet"    -> bottom sheet (filters, action lists)
 */
export const AppModal = ({ visible, onClose, title, children, variant = 'center' }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isSheet = variant === 'sheet';

  return (
    <RNModal visible={visible} transparent animationType={isSheet ? 'slide' : 'fade'} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }, isSheet && styles.overlayBottom]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.panel,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSheet ? styles.sheetPanel : styles.centerPanel,
              ]}
            >
              {isSheet && <View style={[styles.grabber, { backgroundColor: colors.border }]} />}
              {(title || onClose) && (
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
                  {!!onClose && (
                    <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}>
                      <X size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  panel: {
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 20px 40px rgba(15,23,42,0.18)' }
      : { shadowColor: 'rgba(15,23,42,0.2)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24 }),
    elevation: 8,
  },
  centerPanel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
  },
  sheetPanel: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

export default AppModal;
