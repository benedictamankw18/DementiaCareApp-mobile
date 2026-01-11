/**
 * Edit Profile Screen
 * Dementia Care Mobile Application
 * 
 * Allows caregiver to edit their profile information
 */

import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Text, Button, Switch, ActivityIndicator } from 'react-native-paper';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { t } from '../../services/i18nService';

const EditProfileScreen = ({ route, navigation }) => {
  const { user } = route.params || {};
  const { colors: themeColors } = useTheme();

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone === 'Not set' ? '' : (user?.phone || ''),
    fontSize: user?.fontSize || 16,
    highContrastEnabled: user?.highContrastEnabled || false,
  });

  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert(t('activity.validationError'), t('profile.nameRequired'));
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser?.uid) return;

    setLoading(true);
    try {
      const payload = {
        fullName: editForm.name.trim(),
        phone: editForm.phone.trim(),
        fontSize: Number(editForm.fontSize) || 16,
        highContrastEnabled: !!editForm.highContrastEnabled,
      };

      await firestore().collection('users').doc(currentUser.uid).set(payload, { merge: true });

      Alert.alert(t('activity.success'), t('profile.profileUpdated'));
      navigation.goBack();
    } catch (error) {
      console.error('[EditProfile] save profile error:', error);
      Alert.alert(t('common.error'), t('profile.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView style={[styles.scrollView, { backgroundColor: themeColors.background }]}>
        <View style={styles.content}>
          <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
            <Card.Content>
              <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>
                {t('profile.personalInformation')}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>{t('profile.fullName')} *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.lightGray }]}
                  placeholder={t('profile.enterFullName')}
                  placeholderTextColor={themeColors.textLight}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>{t('profile.phone')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.lightGray }]}
                  placeholder={t('profile.enterPhone')}
                  placeholderTextColor={themeColors.textLight}
                  keyboardType="phone-pad"
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, phone: text }))}
                  editable={!loading}
                />
              </View>

              <Text style={[typography.heading3, styles.sectionTitle]}>
                {t('profile.accessibilitySettings')}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>{t('profile.fontSize')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.lightGray }]}
                  placeholder={t('profile.fontSizeDefault')}
                  placeholderTextColor={themeColors.textLight}
                  keyboardType="numeric"
                  value={String(editForm.fontSize)}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, fontSize: text }))}
                  editable={!loading}
                />
                <Text style={[styles.helperText, { color: themeColors.textSecondary }]}>
                  {t('profile.currentSize', { size: editForm.fontSize })}
                </Text>
              </View>

              <View style={styles.toggleSection}>
                <View style={styles.toggleContent}>
                  <Text style={[styles.toggleLabel, { color: themeColors.text }]}>{t('profile.highContrastMode')}</Text>
                  <Text style={[styles.toggleDescription, { color: themeColors.textSecondary }]}>
                    {t('profile.improveReadability')}
                  </Text>
                </View>
                <Switch
                  value={editForm.highContrastEnabled}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({ ...prev, highContrastEnabled: val }))
                  }
                  color={themeColors.primary}
                  disabled={loading}
                />
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: themeColors.background, borderTopColor: themeColors.lightGray }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          mode="contained"
          onPress={handleSaveProfile}
          style={styles.button}
          disabled={loading}
          loading={loading}
        >
          {loading ? t('profile.saving') : t('profile.saveChanges')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  toggleContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  button: {
    flex: 1,
  },
});

export default EditProfileScreen;
