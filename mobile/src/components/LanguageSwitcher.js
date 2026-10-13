import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ChevronDown, Check, Languages } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { changeLanguage, SUPPORTED_LANGUAGES } from '../i18n';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const currentLanguage = SUPPORTED_LANGUAGES.includes(i18n.language) ? i18n.language : 'en';
  const label = t(`common.${currentLanguage === 'en' ? 'english' : currentLanguage === 'mr' ? 'marathi' : currentLanguage === 'hi' ? 'hindi' : 'kannada'}`);
  const languageLabels = {
    en: t('common.english'),
    mr: t('common.marathi'),
    hi: t('common.hindi'),
    kn: t('common.kannada'),
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t('common.changeLanguage')}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(true)}
        style={[styles.button, { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface }]}
        activeOpacity={0.75}
      >
        <View style={styles.content}>
          <Languages size={15} color={theme.colors.primary} strokeWidth={2.5} />
          <Text numberOfLines={1} style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
          <ChevronDown size={14} color={theme.colors.primary} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.menuTitle, { color: theme.colors.textMuted }]}>{t('common.changeLanguage')}</Text>
            {SUPPORTED_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language}
                accessibilityRole="menuitem"
                onPress={async () => {
                  await changeLanguage(language);
                  setIsOpen(false);
                }}
                style={[styles.option, currentLanguage === language && { backgroundColor: theme.colors.infoSoft }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>{languageLabels[language]}</Text>
                {currentLanguage === language && <Check size={16} color={theme.colors.primary} strokeWidth={3} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: { minWidth: 102, maxWidth: 132, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  label: { flexShrink: 1, fontSize: 12, fontWeight: '800' },
  backdrop: { flex: 1, alignItems: 'flex-end', paddingTop: 78, paddingRight: 16, backgroundColor: 'rgba(0,0,0,0.08)' },
  menu: { width: 178, borderWidth: 1, borderRadius: 16, padding: 8, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  menuTitle: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 7, textTransform: 'uppercase' },
  option: { minHeight: 42, borderRadius: 11, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 14, fontWeight: '700' },
});

export default LanguageSwitcher;