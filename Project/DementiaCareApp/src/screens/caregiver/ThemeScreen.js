/**
 * Theme Settings Screen
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
import { t } from '../../services/i18nService';

const ThemeScreen = ({ navigation }) => {
  const { currentTheme, setCurrentTheme, colors: themeColors } = useTheme();
  const [theme, setTheme] = useState(currentTheme);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('preference_theme');
      if (savedTheme) {
        setTheme(savedTheme);
        console.log('[ThemeScreen] Loaded theme from localStorage:', savedTheme);
      }
    } catch (error) {
      console.error('[ThemeScreen] Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Save to local storage
      await AsyncStorage.setItem('preference_theme', theme);
      console.log('[ThemeScreen] Saved theme to localStorage:', theme);

      // Also save to Firestore
      const currentUser = auth().currentUser;
      if (currentUser?.uid) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .set({ preference_theme: theme }, { merge: true });
        console.log('[ThemeScreen] Saved theme to Firestore:', theme);
      }

      // Update global theme context
      setCurrentTheme(theme);
      console.log('[ThemeScreen] Updated global theme context:', theme);

      Alert.alert(t('common.success'), t('theme.saved'));
      navigation.goBack();
    } catch (error) {
      console.error('[ThemeScreen] Error saving theme:', error);
      Alert.alert(t('common.error'), t('theme.failedToSave'));
    } finally {
      setLoading(false);
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
              {t('theme.chooseTheme')}
            </Text>

            <View style={styles.optionRow}>
              <RadioButton
                value="Light"
                status={theme === 'Light' ? 'checked' : 'unchecked'}
                onPress={() => setTheme('Light')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('theme.light')}</Text>
            </View>

            <View style={styles.optionRow}>
              <RadioButton
                value="Dark"
                status={theme === 'Dark' ? 'checked' : 'unchecked'}
                onPress={() => setTheme('Dark')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('theme.dark')}</Text>
            </View>

            <View style={styles.optionRow}>
              <RadioButton
                value="Auto"
                status={theme === 'Auto' ? 'checked' : 'unchecked'}
                onPress={() => setTheme('Auto')}
                color={themeColors.primary}
              />
              <Text style={[styles.optionLabel, { color: themeColors.text }]}>{t('theme.auto')}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          {t('profile.saveChanges')}
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

export default ThemeScreen;
