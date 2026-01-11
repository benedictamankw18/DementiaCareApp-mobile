/**
 * Patient Home Screen
 * Dementia Care Mobile Application
 * 
 * Main screen for patients showing:
 * - Upcoming reminders
 * - Emergency SOS button
 * - Quick access to activities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, FAB } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import { getPatientReminders, completeReminder, saveSOSAlert } from '../../services/firestoreService';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import auth from '@react-native-firebase/auth';

const PatientHomeScreen = ({ route, navigation }) => {
  const { getTextSize, settings } = useSettings();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const patientId = route.params?.patientId;

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const patientReminders = await getPatientReminders(patientId);
      setReminders(patientReminders);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reminders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to send an emergency alert to your caregivers?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Send Alert',
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) {
                Alert.alert('Error', 'User not authenticated');
                return;
              }

              // Get current location (non-blocking, app continues if location fails)
              let location = null;
              try {
                const position = await new Promise((resolve) => {
                  // Use lower accuracy and longer timeout for better compatibility
                  const timeoutId = setTimeout(() => {
                    console.warn('Location request timed out');
                    resolve(null); // Resolve with null instead of rejecting
                  }, 10000); // 10 second timeout
                  
                  Geolocation.getCurrentPosition(
                    (position) => {
                      clearTimeout(timeoutId);
                      resolve(position);
                    },
                    (error) => {
                      clearTimeout(timeoutId);
                      console.warn('Geolocation error:', error.message);
                      resolve(null); // Resolve with null instead of rejecting
                    },
                    { 
                      enableHighAccuracy: false, // Use less accurate but faster location
                      timeout: 10000, 
                      maximumAge: 300000 // Allow 5 minute old location
                    }
                  );
                });
                
                if (position) {
                  location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                  };
                  console.log('Location obtained:', location);
                }
              } catch (locationError) {
                console.warn('Could not get location:', locationError.message);
                // Continue without location - not critical for SOS
              }

              await saveSOSAlert(currentUser.uid, location);
              Alert.alert('Success', 'Emergency alert sent to your caregivers' + (location ? ' with your location' : ''));
            } catch (error) {
              console.error('Error sending SOS alert:', error);
              Alert.alert('Error', 'Failed to send emergency alert');
            }
          },
        },
      ]
    );
  };

  const handleMarkDone = async (reminderId) => {
    try {
      await completeReminder(reminderId, patientId);
      
      // Update local state to remove completed reminder
      setReminders(reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, isCompleted: true }
          : reminder
      ));
      
      Alert.alert('Success', 'Reminder marked as completed!');
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      Alert.alert('Error', 'Failed to mark reminder as completed');
    }
  };

  return (
    <View style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Header */}
        <View style={[styles.header, settings.highContrast && { backgroundColor: '#000', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
          <Text style={[styles.welcomeText, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>Welcome</Text>
          <Text style={[styles.headerSubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
            Here are your reminders and activities for today
          </Text>
        </View>

        {/* Upcoming Reminders Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Today's Reminders</Text>
          
          {loading ? (
            <Text style={[styles.loadingText, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Loading...</Text>
          ) : reminders.length > 0 ? (
            reminders.slice(0, 3).map((reminder) => (
              <Card key={reminder.id} style={[styles.reminderCard, settings.highContrast && { backgroundColor: '#a39c9c', borderWidth: 2, borderColor: '#FFF' }]}>
                <Card.Content>
                  <View style={styles.reminderHeader}>
                    <Text style={[styles.reminderTitle, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>{reminder.title}</Text>
                    {reminder.isCompleted && (
                      <Text style={[styles.completedBadge, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#0F0' }]}>✓ Done</Text>
                    )}
                  </View>
                  <Text style={[styles.reminderDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                    {reminder.description}
                  </Text>
                </Card.Content>
                {!reminder.isCompleted && (
                  <Card.Actions>
                    <Button 
                      mode="contained"
                      onPress={() => handleMarkDone(reminder.id)}
                    >
                      Mark Done
                    </Button>
                  </Card.Actions>
                )}
              </Card>
            ))
          ) : (
            <Text style={[styles.noRemindersText, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
              No reminders for today. Enjoy your day!
            </Text>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, styles.gameButton, settings.highContrast && { backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' }]}
              onPress={() => navigation.navigate('Games')}
            >
              <Text style={styles.actionIcon}>🎮</Text>
              <Text style={[styles.actionLabel, { fontSize: getTextSize(14), color: colors.text }]}>Games</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.activitiesButton]}
              onPress={() => navigation.navigate('Activities')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={[styles.actionLabel, { fontSize: getTextSize(14), color: colors.text }]}>Activities</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.settingsButton]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={[styles.actionLabel, { fontSize: getTextSize(14), color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Emergency SOS Button */}
      <FAB
        style={[styles.sosButton, { backgroundColor: colors.accent }]}
        icon="phone-emergency"
        label="SOS"
        onPress={handleSOSPress}
        color={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  headerSubtext: {
    fontSize: typography.body,
    color: colors.white,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reminderCard: {
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reminderTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  completedBadge: {
    fontSize: typography.caption,
    color: colors.success,
    fontWeight: typography.semibold,
  },
  reminderDescription: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  noRemindersText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameButton: {
    backgroundColor: '#FFE57F',
  },
  activitiesButton: {
    backgroundColor: '#81C784',
  },
  settingsButton: {
    backgroundColor: '#64B5F6',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  comingSoon: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 4,
  },
  sosButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.error,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PatientHomeScreen;
