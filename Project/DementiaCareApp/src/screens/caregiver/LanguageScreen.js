/**
 * Language Settings Screen
 * Dementia Care Mobile Application
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Text, RadioButton, Button, ActivityIndicator } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { t, setLanguage, getCurrentLanguage, getAvailableLanguages } from '../../services/i18nService';

const LanguageScreen = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const [language, setLanguageState] = useState('English');
  const [loading, setLoading] = useState(true);
  const languageMap = {
    'English': 'en',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
  };
  const reverseLanguageMap = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const currentLang = getCurrentLanguage();
      const displayName = reverseLanguageMap[currentLang] || 'English';
      setLanguageState(displayName);
      console.log('[LanguageScreen] Loaded language:', displayName);
    } catch (error) {
      console.error('[LanguageScreen] Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const langCode = languageMap[language];
      
      // Use i18n service to set language with the code, not the display name
      const success = await setLanguage(langCode);
      if (!success) {
        throw new Error('Failed to set language');
      }

      // Also save to Firestore with the language code
      const currentUser = auth().currentUser;
      if (currentUser?.uid) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .set({ preference_language: langCode }, { merge: true });
        console.log('[LanguageScreen] Saved language to Firestore:', langCode);
      }

      Alert.alert(t('common.success'), t('settings.languageSaved'));
      navigation.goBack();
    } catch (error) {
      console.error('[LanguageScreen] Error saving language:', error);
      Alert.alert(t('common.error'), t('settings.failedToSave'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>
              {t('settings.selectLanguage')}
            </Text>

            <View style={styles.optionRow}>
              <RadioButton
                value="English"
                status={language === 'English' ? 'checked' : 'unchecked'}
                onPress={() => setLanguageState('English')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('settings.english')}</Text>
            </View>

            <View style={styles.optionRow}>
              <RadioButton
                value="Spanish"
                status={language === 'Spanish' ? 'checked' : 'unchecked'}
                onPress={() => setLanguageState('Spanish')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('settings.spanish')}</Text>
            </View>

            <View style={styles.optionRow}>
              <RadioButton
                value="French"
                status={language === 'French' ? 'checked' : 'unchecked'}
                onPress={() => setLanguageState('French')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('settings.french')}</Text>
            </View>

            <View style={styles.optionRow}>
              <RadioButton
                value="German"
                status={language === 'German' ? 'checked' : 'unchecked'}
                onPress={() => setLanguageState('German')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('settings.german')}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          {t('settings.saveChanges')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
    color: colors.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  optionLabel: {
    marginLeft: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
  },
  button: {
    marginTop: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default LanguageScreen;
