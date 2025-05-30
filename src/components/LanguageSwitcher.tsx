import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const insets = useSafeAreaInsets();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          currentLanguage === 'en' && styles.activeLanguage,
        ]}
        onPress={() => i18n.changeLanguage('en')}
      >
        <Text
          style={[
            styles.languageText,
            currentLanguage === 'en' && styles.activeLanguageText,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.languageButton,
          currentLanguage === 'vi' && styles.activeLanguage,
        ]}
        onPress={() => i18n.changeLanguage('vi')}
      >
        <Text
          style={[
            styles.languageText,
            currentLanguage === 'vi' && styles.activeLanguageText,
          ]}
        >
          VI
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
    zIndex: 1000,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeLanguage: {
    backgroundColor: '#007AFF',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeLanguageText: {
    color: '#fff',
  },
});

export default LanguageSwitcher; 