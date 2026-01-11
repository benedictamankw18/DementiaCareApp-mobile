/**
 * SOS Settings Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Configure SOS button behavior and emergency alert settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card, Text, Switch, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { saveSOSSettings, getSOSSettings } from '../../services/firestoreService';
import auth from '@react-native-firebase/auth';

const SOSSettingsScreen = ({ navigation }) => {
  // Call all hooks first, in consistent order
  const { getTextSize, settings: accessibilitySettings } = useSettings();
  const currentUser = auth().currentUser;
  const patientId = currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    enableSOS: true,
    requireConfirmation: true,
    sendLocation: true,
    sendNotification: true,
    sendMessage: false,
    vibrationPattern: true,
    soundAlert: true,
  });

  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (patientId) {
          const firestoreSettings = await getSOSSettings(patientId);
          setSettings(firestoreSettings);
        }
      } catch (error) {
        console.error('[SOSSettingsScreen] Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [patientId]);

  const handleToggle = async (key) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(updatedSettings);

    // Save to Firestore
    try {
      if (patientId) {
        await saveSOSSettings(patientId, updatedSettings);
      }
    } catch (error) {
      console.error('[SOSSettingsScreen] Error saving settings:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const settingsList = [
    {
      key: 'enableSOS',
      title: 'Enable SOS Button',
      description: 'Activate the emergency SOS functionality',
      icon: 'alert-circle',
    },
    {
      key: 'requireConfirmation',
      title: 'Require Confirmation',
      description: 'Ask for confirmation before sending alert',
      icon: 'checkbox-marked-circle-outline',
    },
    {
      key: 'sendLocation',
      title: 'Send Location',
      description: 'Include GPS location in emergency alert',
      icon: 'map-marker',
    },
    {
      key: 'sendNotification',
      title: 'Push Notification',
      description: 'Notify caregivers via push notifications',
      icon: 'bell-ring',
    },
    {
      key: 'sendMessage',
      title: 'Send SMS',
      description: 'Send emergency alert via SMS',
      icon: 'message-alert',
    },
    {
      key: 'vibrationPattern',
      title: 'Vibration Alert',
      description: 'Vibrate when alert is sent',
      icon: 'vibrate',
    },
    {
      key: 'soundAlert',
      title: 'Sound Alert',
      description: 'Play sound when alert is sent',
      icon: 'volume-high',
    },
  ];

  return (
    <ScrollView style={[styles.container, accessibilitySettings.highContrast && { backgroundColor: '#000' }]}>
      <View style={[styles.header, accessibilitySettings.highContrast && { backgroundColor: '#000', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
        <Text style={[typography.heading3, styles.headerTitle, { fontSize: getTextSize(20), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
          SOS Settings
        </Text>
        <Text style={[styles.headerSubtext, { fontSize: getTextSize(14), color: colors.textSecondary }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
          Configure how your emergency alerts are sent
        </Text>
      </View>

      <View style={[styles.section, accessibilitySettings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[typography.heading3, styles.sectionTitle, { fontSize: getTextSize(18), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
          Alert Behavior
        </Text>

        <Card style={[styles.settingsCard, accessibilitySettings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            {settingsList.map((setting, index) => (
              <View key={setting.key}>
                <View style={styles.settingRow}>
                  <Icon
                    name={setting.icon}
                    size={24}
                    color={accessibilitySettings.highContrast ? '#FFF' : colors.primary}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingLabel, { fontSize: getTextSize(14), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>{setting.title}</Text>
                    <Text style={[styles.settingDescription, { fontSize: getTextSize(12), color: colors.textSecondary }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
                      {setting.description}
                    </Text>
                  </View>
                  <Switch
                    value={settings[setting.key]}
                    onValueChange={() => handleToggle(setting.key)}
                    color={accessibilitySettings.highContrast ? '#FFF' : colors.primary}
                  />
                </View>
                {index < settingsList.length - 1 && (
                  <Divider style={[styles.divider, { backgroundColor: colors.lightGray }, accessibilitySettings.highContrast && { backgroundColor: '#333' }]} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>

      <View style={[styles.section, accessibilitySettings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[typography.heading3, styles.sectionTitle, { fontSize: getTextSize(18), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
          Response Time
        </Text>

        <Card style={[styles.infoCard, accessibilitySettings.highContrast && { backgroundColor: '#1a1a1a', borderLeftColor: '#FFF', borderLeftWidth: 4, borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="clock-fast" size={24} color={accessibilitySettings.highContrast ? '#FFF' : colors.success} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { fontSize: getTextSize(14), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>Expected Response</Text>
                <Text style={[styles.infoValue, { fontSize: getTextSize(12), color: colors.textSecondary }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
                  Your caregivers will be alerted immediately
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={[styles.section, accessibilitySettings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[typography.heading3, styles.sectionTitle, { fontSize: getTextSize(18), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
          Test Alert
        </Text>

        <Card style={[styles.testCard, accessibilitySettings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <Text style={[styles.testDescription, { fontSize: getTextSize(14), color: colors.text }, accessibilitySettings.highContrast && { color: '#FFF' }]}>
              Send a test alert to verify settings (caregivers will be notified it's a test)
            </Text>
            <View style={styles.testButtonContainer}>
              {/* Button would go here */}
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  headerTitle: {
    color: colors.white,
    marginBottom: spacing.sm,
  },
  headerSubtext: {
    color: colors.white,
    fontSize: 14,
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
    borderRadius: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingIcon: {
    marginRight: spacing.md,
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
  divider: {
    marginVertical: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  infoValue: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  testCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  testDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  testButtonContainer: {
    // Button container for future use
  },
});

export default SOSSettingsScreen;
