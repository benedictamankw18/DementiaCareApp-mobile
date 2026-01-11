/**
 * Settings Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Patient preferences and app settings
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, Text, Button, Switch, Avatar, Divider, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';

const PatientSettingsScreen = ({ navigation, authContext }) => {
  const currentUser = auth().currentUser;
  const { settings, handleToggle, getTextSize } = useSettings();
  
  const [user, setUser] = useState({
    name: currentUser?.displayName || 'Patient User',
    email: currentUser?.email || 'patient@example.com',
    role: 'patient',
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await analytics().logEvent('logout', { role: user?.role || 'patient' });
          } catch (error) {
            console.warn('Analytics logout event failed:', error.message);
          }
          
          try {
            await auth().signOut();
          } catch (error) {
            console.error('[PatientSettingsScreen] Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEmergencyContact = () => {
    // Navigate to emergency contact management screen
    if (navigation?.navigate) {
      navigation.navigate('EmergencyContact');
    } else {
      Alert.alert('Coming Soon', 'Emergency contact management feature is coming soon');
    }
  };

  const handleSOSSettings = () => {
    // Navigate to SOS settings screen
    if (navigation?.navigate) {
      navigation.navigate('SOSSettings');
    } else {
      Alert.alert('Coming Soon', 'SOS settings feature is coming soon');
    }
  };

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: colors.highContrast?.background || '#000' }]}>
      {/* Profile Section */}
      <View style={[styles.profileSection, settings.highContrast && { backgroundColor: '#000' }]}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
            backgroundColor={settings.highContrast ? '#FFF' : colors.primary}
          />
          <View style={styles.profileInfo}>
            <Text style={[typography.heading2, { fontSize: getTextSize(20) }, settings.highContrast && { color: '#FFF' }]}>{user.name}</Text>
            <Text style={[styles.profileRole, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Patient</Text>
          </View>
        </View>

        <Card style={[styles.profileCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={settings.highContrast ? '#FFF' : colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Email</Text>
                <Text style={[styles.infoValue, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>{user.email}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Notifications Settings */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle, settings.largeText && { fontSize: 20 }, settings.highContrast && { color: '#FFF' }]}>Notifications</Text>

        <Card style={[styles.settingsCard, settings.highContrast && { backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Reminders</Text>
                <Text style={[styles.settingDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                  Get notified about medication and activities
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => handleToggle('notifications')}
                color={colors.primary}
              />
            </View>

            <Divider style={[styles.divider, settings.highContrast && { backgroundColor: '#333' }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Sound Alerts</Text>
                <Text style={[styles.settingDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                  Play sound for important reminders
                </Text>
              </View>
              <Switch
                value={settings.soundAlerts}
                onValueChange={() => handleToggle('soundAlerts')}
                color={colors.primary}
                disabled={!settings.notifications}
              />
            </View>

            <Divider style={[styles.divider, settings.highContrast && { backgroundColor: '#333' }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Vibration</Text>
                <Text style={[styles.settingDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                  Vibrate for reminders
                </Text>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={() => handleToggle('vibration')}
                color={colors.primary}
                disabled={!settings.notifications}
              />
            </View>

            <Divider style={[styles.divider, settings.highContrast && { backgroundColor: '#333' }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Voice Reminders</Text>
                <Text style={[styles.settingDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                  Speak reminders out loud
                </Text>
              </View>
              <Switch
                value={settings.voiceReminders}
                onValueChange={() => handleToggle('voiceReminders')}
                color={colors.primary}
                disabled={!settings.notifications}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Accessibility Settings */}
      <View style={[styles.section, settings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[typography.heading3, styles.sectionTitle, { fontSize: getTextSize(20) }, settings.highContrast && { color: '#FFF' }]}>Accessibility</Text>

        <Card style={[styles.settingsCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Large Text</Text>
                <Text style={[styles.settingDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                  Increase text size throughout the app
                </Text>
              </View>
              <Switch
                value={settings.largeText}
                onValueChange={() => handleToggle('largeText')}
                color={settings.highContrast ? '#FFF' : colors.primary}
              />
            </View>

            <Divider style={[styles.divider, settings.highContrast && { backgroundColor: '#333' }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>High Contrast</Text>
                <Text style={[styles.settingDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                  Use high contrast colors for better visibility
                </Text>
              </View>
              <Switch
                value={settings.highContrast}
                onValueChange={() => handleToggle('highContrast')}
                color={settings.highContrast ? '#FFF' : colors.primary}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Emergency Contact */}
      <View style={[styles.section, settings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[typography.heading3, styles.sectionTitle, { fontSize: getTextSize(20) }, settings.highContrast && { color: '#FFF' }]}>Emergency</Text>

        <Card style={[styles.settingsCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <List.Item
              title="Emergency Contact"
              description="View and manage emergency contacts"
              titleStyle={[{ fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}
              descriptionStyle={[{ fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}
              left={props => <Icon name="phone-alert" size={24} color={settings.highContrast ? '#FFF' : colors.error} {...props} />}
              right={props => <Icon name="chevron-right" size={24} color={settings.highContrast ? '#FFF' : colors.gray} {...props} />}
              onPress={handleEmergencyContact}
            />
            <Divider style={[styles.divider, settings.highContrast && { backgroundColor: '#333' }]} />
            <List.Item
              title="SOS Settings"
              description="Configure SOS button behavior"
              titleStyle={[{ fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}
              descriptionStyle={[{ fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}
              left={props => <Icon name="alert-circle" size={24} color={settings.highContrast ? '#FFF' : colors.error} {...props} />}
              right={props => <Icon name="chevron-right" size={24} color={settings.highContrast ? '#FFF' : colors.gray} {...props} />}
              onPress={handleSOSSettings}
            />
          </Card.Content>
        </Card>
      </View>

      {/* App Info */}
      <View style={[styles.section, settings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[typography.heading3, styles.sectionTitle, { fontSize: getTextSize(20) }, settings.highContrast && { color: '#FFF' }]}>About</Text>

        <Card style={[styles.settingsCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="information" size={20} color={settings.highContrast ? '#FFF' : colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>App Version</Text>
                <Text style={[styles.infoValue, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>1.0.0</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Logout Button */}
      <View style={[styles.logoutSection, settings.highContrast && { backgroundColor: '#000' }]}>
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          labelStyle={[styles.logoutButtonLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}
          style={[styles.logoutButton, settings.highContrast && { borderColor: '#FFF' }]}
        >
          Logout
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
  logoutSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  logoutButtonLabel: {
    color: colors.error,
  },
});

export default PatientSettingsScreen;
