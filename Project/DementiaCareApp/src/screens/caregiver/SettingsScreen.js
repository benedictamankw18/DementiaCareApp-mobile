/**
 * Settings Screen
 * Dementia Care Mobile Application
 * 
 * User profile, preferences, and app settings
 */

import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getUserProfile } from '../../services/authService';
import { useTheme } from '../../state/ThemeContext';
import { t } from '../../services/i18nService';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Card, Text, Button, Switch, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';

const SettingsScreen = ({ navigation, authContext }) => {
  const { colors: themeColors } = useTheme();
  const [user, setUser] = useState({
    name: 'Loading...',
    email: '',
    phone: '',
    role: 'caregiver',
    fontSize: 16,
    highContrastEnabled: false,
  });

  const [notifications, setNotifications] = useState({
    reminders: true,
    alerts: true,
    updates: true,
    locationTracking: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'Light',
    language: 'English',
    notificationTime: 'Custom',
  });

  const [loading, setLoading] = useState(true);

  const handleToggle = (key) => {
    const updated = !notifications[key];
    setNotifications((prev) => ({
      ...prev,
      [key]: updated,
    }));

    // Save to local storage
    AsyncStorage.setItem(`notification_${key}`, JSON.stringify(updated))
      .catch((err) => console.error('[Settings] localStorage save failed:', err));

    // Also save to Firestore
    const currentUser = auth().currentUser;
    if (currentUser?.uid) {
      firestore()
        .collection('users')
        .doc(currentUser.uid)
        .set({ [key]: updated }, { merge: true })
        .catch((err) => console.error('[Settings] toggle update failed:', err));
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const trackLogout = async () => {
    try {
      await analytics().logEvent('logout', { role: user?.role || 'unknown' });
    } catch (error) {
      console.warn('Analytics logout event failed:', error.message);
    }
  };

  const loadPreferences = async () => {
    try {
      const savedPreferences = { theme: 'Light', language: 'English', notificationTime: 'Custom' };
      
      const theme = await AsyncStorage.getItem('preference_theme');
      const language = await AsyncStorage.getItem('preference_language');
      const notificationTime = await AsyncStorage.getItem('preference_notificationTime');

      if (theme !== null && theme !== undefined && theme !== '') {
        savedPreferences.theme = theme;
      }
      if (language !== null && language !== undefined && language !== '') {
        savedPreferences.language = language;
      }
      if (notificationTime !== null && notificationTime !== undefined && notificationTime !== '') {
        savedPreferences.notificationTime = notificationTime;
      }

      console.log('[Settings] Loaded preferences from localStorage:', savedPreferences);
      setPreferences(savedPreferences);
    } catch (err) {
      console.warn('[Settings] localStorage preferences load failed:', err);
    }
  };

  const loadProfile = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser?.uid) return;

      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        setUser({
          name: profile.fullName || profile.displayName || 'Caregiver',
          email: profile.email || currentUser.email || '',
          phone: profile.phone || profile.phoneNumber || 'Not set',
          role: profile.role || 'caregiver',
          fontSize: profile.fontSize || 16,
          highContrastEnabled: profile.highContrastEnabled || false,
        });

        // Load notifications from local storage first, then fall back to Firestore
        const savedNotifications = {};
        try {
          const reminders = await AsyncStorage.getItem('notification_reminders');
          const alerts = await AsyncStorage.getItem('notification_alerts');
          const updates = await AsyncStorage.getItem('notification_updates');
          const locationTracking = await AsyncStorage.getItem('notification_locationTracking');

          savedNotifications.reminders = reminders !== null ? JSON.parse(reminders) : (profile.notificationsEnabled ?? true);
          savedNotifications.alerts = alerts !== null ? JSON.parse(alerts) : (profile.alertsEnabled ?? profile.notificationsEnabled ?? true);
          savedNotifications.updates = updates !== null ? JSON.parse(updates) : (profile.updatesEnabled ?? true);
          savedNotifications.locationTracking = locationTracking !== null ? JSON.parse(locationTracking) : (profile.locationSharingEnabled ?? true);

          console.log('[Settings] Loaded notifications from localStorage:', savedNotifications);
        } catch (err) {
          console.warn('[Settings] localStorage load failed, using Firestore data:', err);
          savedNotifications.reminders = profile.notificationsEnabled ?? true;
          savedNotifications.alerts = profile.alertsEnabled ?? profile.notificationsEnabled ?? true;
          savedNotifications.updates = profile.updatesEnabled ?? true;
          savedNotifications.locationTracking = profile.locationSharingEnabled ?? true;
        }

        setNotifications(savedNotifications);
        setLoading(false);
      }
    } catch (error) {
      console.error('[Settings] loadProfile error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Reload profile when screen comes into focus (e.g., after returning from EditProfile)
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      loadPreferences();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(t('common.ok'), t('settings.logoutConfirm'), [
      {
        text: t('common.cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('settings.logout'),
        onPress: async () => {
          await trackLogout();
          try {
            await auth().signOut();
          } catch (error) {
            console.error('[SettingsScreen] Logout error:', error);
            Alert.alert(t('common.error'), t('settings.logoutError'));
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { user });
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
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
            backgroundColor={themeColors.primary}
          />
          <View style={styles.profileInfo}>
            <Text style={[typography.heading2, { color: themeColors.text }]}>{user.name}</Text>
            <Text style={[styles.profileRole, { color: themeColors.textSecondary }]}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
          </View>
        </View>

        <Card style={[styles.profileCard, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={themeColors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{t('settings.email')}</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{user.email}</Text>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color={themeColors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{t('settings.phone')}</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{user.phone}</Text>
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              {t('settings.editProfile')}
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>{t('settings.notifications')}</Text>

        <Card style={[styles.settingsCard, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>{t('settings.reminderAlerts')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                  {t('settings.reminderAlertsDesc')}
                </Text>
              </View>
              <Switch
                value={notifications.reminders}
                onValueChange={() => handleToggle('reminders')}
                color={themeColors.primary}
              />
            </View>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>{t('settings.criticalAlerts')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                  {t('settings.criticalAlertsDesc')}
                </Text>
              </View>
              <Switch
                value={notifications.alerts}
                onValueChange={() => handleToggle('alerts')}
                color={themeColors.primary}
              />
            </View>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>{t('settings.appUpdates')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                  {t('settings.appUpdatesDesc')}
                </Text>
              </View>
              <Switch
                value={notifications.updates}
                onValueChange={() => handleToggle('updates')}
                color={themeColors.primary}
              />
            </View>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>{t('settings.locationTracking')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                  {t('settings.locationTrackingDesc')}
                </Text>
              </View>
              <Switch
                value={notifications.locationTracking}
                onValueChange={() => handleToggle('locationTracking')}
                color={themeColors.primary}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>{t('settings.preferences')}</Text>

        <Card style={[styles.settingsCard, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <Pressable onPress={() => navigation.navigate('Theme')}>
              <View style={styles.preferenceRow}>
                <Icon name="palette" size={20} color={themeColors.primary} />
                <View style={styles.preferenceContent}>
                  <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>{t('settings.theme')}</Text>
                  <Text style={[styles.preferenceValue, { color: themeColors.textSecondary }]}>{preferences.theme}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={themeColors.textSecondary} />
              </View>
            </Pressable>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <Pressable onPress={() => navigation.navigate('Language')}>
              <View style={styles.preferenceRow}>
                <Icon name="translate" size={20} color={themeColors.primary} />
                <View style={styles.preferenceContent}>
                  <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>{t('settings.language')}</Text>
                  <Text style={[styles.preferenceValue, { color: themeColors.textSecondary }]}>{preferences.language}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={themeColors.textSecondary} />
              </View>
            </Pressable>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <Pressable onPress={() => navigation.navigate('NotificationTime')}>
              <View style={styles.preferenceRow}>
                <Icon name="bell" size={20} color={themeColors.primary} />
                <View style={styles.preferenceContent}>
                  <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>{t('settings.notificationTime')}</Text>
                  <Text style={[styles.preferenceValue, { color: themeColors.textSecondary }]}>{preferences.notificationTime}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={themeColors.textSecondary} />
              </View>
            </Pressable>
          </Card.Content>
        </Card>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>{t('settings.about')}</Text>

        <Card style={[styles.settingsCard, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="information" size={20} color={themeColors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{t('settings.appVersion')}</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>1.0.0</Text>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <Pressable onPress={() => navigation.navigate('TermsOfService')}>
              <View style={styles.infoRow}>
                <Icon name="file-document" size={20} color={themeColors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{t('settings.termsOfService')}</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>{t('settings.viewTerms')}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={themeColors.textSecondary} />
              </View>
            </Pressable>

            <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />

            <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
              <View style={styles.infoRow}>
                <Icon name="shield-lock" size={20} color={themeColors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{t('settings.privacyPolicy')}</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>{t('settings.viewPolicy')}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={themeColors.textSecondary} />
              </View>
            </Pressable>
          </Card.Content>
        </Card>
      </View>

      {/* Logout Button */}
      <View style={[styles.logoutSection, { backgroundColor: themeColors.background }]}>
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          labelStyle={[styles.logoutButtonLabel, { color: themeColors.text }]}
          style={styles.logoutButton}
        >
          {t('settings.logout')}
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
  profileSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  profileRole: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  section: {
    padding: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.text,
  },
  settingsCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  preferenceContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  preferenceValue: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    marginVertical: spacing.sm,
  },
  editButton: {
    marginTop: spacing.md,
  },
  logoutSection: {
    padding: spacing.lg,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  logoutButtonLabel: {
    color: colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default SettingsScreen;
