/**
 * Reminders Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Displays medication and activity reminders for the patient
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, Chip, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { getPatientReminders, completeReminder, deleteReminder, createReminder } from '../../services/firestoreService';
import auth from '@react-native-firebase/auth';

const RemindersScreen = ({ route }) => {
  // Call all hooks first, in consistent order
  const { getTextSize, settings } = useSettings();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creatingReminder, setCreatingReminder] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    type: 'medication',
    hour: '09',
    minute: '00',
    period: 'AM',
  });

  const currentUser = auth().currentUser;
  const patientId = route.params?.patientId || currentUser?.uid;

  const loadReminders = async () => {
    try {
      const fetchedReminders = await getPatientReminders(patientId);
      setReminders(fetchedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [patientId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleCompleteReminder = (reminderId) => {
    Alert.alert(
      'Mark as Complete',
      'Have you completed this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Completed',
          onPress: async () => {
            try {
              await completeReminder(reminderId, patientId);
              Alert.alert('Success', 'Reminder marked as complete');
              loadReminders();
            } catch (error) {
              console.error('Error completing reminder:', error);
              Alert.alert('Error', 'Failed to complete reminder');
            }
          },
        },
      ]
    );
  };

  const handleDeleteReminder = (reminderId, reminderTitle) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${reminderTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReminder(reminderId);
              Alert.alert('Success', 'Reminder deleted');
              loadReminders();
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const handleCreateReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    setCreatingReminder(true);
    try {
      // Convert 12-hour format to 24-hour format
      let hour = parseInt(newReminder.hour);
      if (newReminder.period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (newReminder.period === 'AM' && hour === 12) {
        hour = 0;
      }
      const time24Hour = `${hour.toString().padStart(2, '0')}:${newReminder.minute}`;

      const reminderData = {
        patientId,
        caregiverId: currentUser.uid,
        title: newReminder.title,
        description: newReminder.description,
        type: newReminder.type,
        time: time24Hour,
        displayTime: `${newReminder.hour}:${newReminder.minute} ${newReminder.period}`,
        frequency: 'daily',
        isActive: true,
      };

      await createReminder(reminderData);

      Alert.alert('Success', 'Reminder created successfully');
      setCreateModalVisible(false);
      setNewReminder({
        title: '',
        description: '',
        type: 'medication',
        hour: '09',
        minute: '00',
        period: 'AM',
      });
      loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setCreatingReminder(false);
    }
  };

  const getTimeUntilReminder = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const diff = reminderTime - now;
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil < 1) {
      return `in ${minutesUntil} min`;
    }
    return `in ${hoursUntil}h ${minutesUntil}m`;
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'medication':
        return 'pill';
      case 'appointment':
        return 'calendar-clock';
      case 'activity':
        return 'run';
      default:
        return 'bell';
    }
  };

  const getReminderColor = (type) => {
    switch (type) {
      case 'medication':
        return colors.error;
      case 'appointment':
        return colors.primary;
      case 'activity':
        return colors.success;
      default:
        return colors.gray;
    }
  };

  const todayReminders = reminders.filter(r => {
    const now = new Date();
    const [hours, minutes] = r.time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return reminderTime.toDateString() === now.toDateString();
  });

  const upcomingReminders = reminders.filter(r => {
    const now = new Date();
    const [hours, minutes] = r.time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return reminderTime > now;
  }).slice(0, 5);

  const completedReminders = reminders.filter(r => r.isCompleted).length;

  if (loading) {
    return (
      <View style={[styles.centerContainer, settings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[{ fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <Card style={[styles.summaryCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Icon name="bell" size={32} color={settings.highContrast ? '#FFF' : colors.primary} />
                <Text style={[styles.summaryNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{reminders.length}</Text>
                <Text style={[styles.summaryLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="clock-alert" size={32} color={settings.highContrast ? '#FFF' : colors.warning} />
                <Text style={[styles.summaryNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{todayReminders.length}</Text>
                <Text style={[styles.summaryLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Today</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="check-circle" size={32} color={settings.highContrast ? '#FFF' : colors.success} />
                <Text style={[styles.summaryNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{completedReminders}</Text>
                <Text style={[styles.summaryLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Today's Reminders */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Today's Reminders</Text>
          {todayReminders.length > 0 ? (
            todayReminders.map((reminder) => (
              <Card key={reminder.id} style={[styles.reminderCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
                <Card.Content>
                  <View style={styles.reminderHeader}>
                    <Icon
                      name={getReminderIcon(reminder.type)}
                      size={40}
                      color={settings.highContrast ? '#FFF' : getReminderColor(reminder.type)}
                    />
                    <View style={styles.reminderInfo}>
                      <Text style={[styles.reminderTitle, { fontSize: getTextSize(16) }, settings.highContrast && { color: '#FFF' }]}>{reminder.title}</Text>
                      <Text style={[styles.reminderDescription, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
                        {reminder.description || 'No description'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reminderFooter}>
                    <Chip
                      icon="clock"
                      style={styles.timeChip}
                      textStyle={styles.chipText}
                    >
                      {reminder.time}
                    </Chip>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getReminderColor(reminder.type) + '20' }]}
                      textStyle={[styles.chipText, { color: getReminderColor(reminder.type) }]}
                    >
                      {getTimeUntilReminder(reminder.time)}
                    </Chip>
                  </View>
                  <View style={styles.reminderActions}>
                    {!reminder.isCompleted ? (
                      <Button
                        mode="contained"
                        icon="check"
                        onPress={() => handleCompleteReminder(reminder.id)}
                        style={styles.completeButton}
                      >
                        Done
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        icon="check-circle"
                        disabled
                        style={[styles.completeButton, styles.completedButton]}
                      >
                        Completed
                      </Button>
                    )}
                    {reminder.caregiverId === currentUser?.uid && (
                      <Button
                        mode="outlined"
                        icon="trash-can"
                        textColor={colors.error}
                        onPress={() => handleDeleteReminder(reminder.id, reminder.title)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
              <Card.Content>
                <View style={styles.emptyState}>
                  <Icon name="calendar-check" size={64} color={settings.highContrast ? '#FFF' : colors.gray} />
                  <Text style={[styles.emptyText, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>No reminders for today</Text>
                  <Text style={[styles.emptySubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>You're all caught up!</Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* All Reminders */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>All Reminders</Text>
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <Card key={reminder.id} style={[styles.reminderCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
                <Card.Content>
                  <View style={styles.reminderRow}>
                    <Icon
                      name={getReminderIcon(reminder.type)}
                      size={24}
                      color={settings.highContrast ? '#FFF' : getReminderColor(reminder.type)}
                    />
                    <View style={styles.reminderDetails}>
                      <Text style={[styles.reminderName, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>{reminder.title}</Text>
                      <Text style={[styles.reminderTime, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>{reminder.time}</Text>
                    </View>
                    <Chip
                      style={styles.typeChip}
                      textStyle={styles.typeChipText}
                    >
                      {reminder.type}
                    </Chip>
                  </View>
                  <View style={styles.allRemindersActions}>
                    {reminder.caregiverId === currentUser?.uid && (
                      <Button
                        mode="text"
                        icon="trash-can"
                        textColor={colors.error}
                        compact
                        onPress={() => handleDeleteReminder(reminder.id, reminder.title)}
                      >
                        Delete
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
              <Card.Content>
                <View style={styles.emptyState}>
                  <Icon name="bell-off" size={64} color={settings.highContrast ? '#FFF' : colors.gray} />
                  <Text style={[styles.emptyText, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>No reminders set</Text>
                  <Text style={[styles.emptySubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Ask your caregiver to add reminders</Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB for creating reminders */}
      <FAB
        icon="plus"
        style={[styles.fab, settings.highContrast && { backgroundColor: '#FFF' }]}
        color={settings.highContrast ? '#000' : '#FFF'}
        onPress={() => setCreateModalVisible(true)}
        label="Add Reminder"
      />

      {/* Create Reminder Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={[styles.modalOverlay, settings.highContrast && { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={[styles.modalContent, settings.highContrast && { backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.heading2, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Create Reminder</Text>
              <Button
                icon="close"
                onPress={() => setCreateModalVisible(false)}
              />
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Title *</Text>
                <TextInput
                  style={[styles.textInput, settings.highContrast && { backgroundColor: '#1a1a1a', borderColor: '#FFF', color: '#FFF' }]}
                  placeholder="e.g., Take Blood Pressure Medicine"
                  placeholderTextColor={settings.highContrast ? '#999' : colors.textSecondary}
                  value={newReminder.title}
                  onChangeText={(text) =>
                    setNewReminder({ ...newReminder, title: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, settings.highContrast && { backgroundColor: '#1a1a1a', borderColor: '#FFF', color: '#FFF' }]}
                  placeholder="Optional details about the reminder"
                  placeholderTextColor={settings.highContrast ? '#999' : colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={newReminder.description}
                  onChangeText={(text) =>
                    setNewReminder({ ...newReminder, description: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Type</Text>
                <View style={styles.typeButtons}>
                  {['medication', 'appointment', 'activity'].map((type) => (
                    <Button
                      key={type}
                      mode={newReminder.type === type ? 'contained' : 'outlined'}
                      onPress={() =>
                        setNewReminder({ ...newReminder, type })
                      }
                      style={[styles.typeButton, settings.highContrast && newReminder.type === type && { backgroundColor: '#FFF' }]}
                      labelStyle={[{ fontSize: getTextSize(12) }, settings.highContrast && { color: newReminder.type === type ? '#000' : '#FFF' }]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Time</Text>
                <TouchableOpacity
                  style={[styles.timePickerButton, settings.highContrast && { backgroundColor: '#1a1a1a', borderColor: '#FFF', borderWidth: 2 }]}
                  onPress={() => setTimePickerVisible(true)}
                >
                  <Icon name="clock-outline" size={20} color={settings.highContrast ? '#FFF' : colors.primary} />
                  <Text style={[styles.timePickerButtonText, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
                    {newReminder.hour}:{newReminder.minute} {newReminder.period}
                  </Text>
                  <Icon name="chevron-down" size={20} color={settings.highContrast ? '#FFF' : colors.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setCreateModalVisible(false)}
                  style={[styles.modalButton, settings.highContrast && { borderColor: '#FFF' }]}
                  disabled={creatingReminder}
                  labelStyle={[{ fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateReminder}
                  style={styles.modalButton}
                  loading={creatingReminder}
                  disabled={creatingReminder}
                  labelStyle={[{ fontSize: getTextSize(12) }]}
                >
                  Create
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={timePickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={[styles.timePickerOverlay, settings.highContrast && { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={[styles.timePickerContent, settings.highContrast && { backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' }]}>
            <View style={[styles.timePickerHeader, settings.highContrast && { borderColor: '#FFF', borderBottomWidth: 2 }]}>
              <Text style={[typography.heading2, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Select Time</Text>
              <Button
                icon="close"
                onPress={() => setTimePickerVisible(false)}
              />
            </View>

            <View style={styles.timePickerBody}>
              {/* Hour Selector */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Hour</Text>
                <View style={[styles.numberButtonsContainer, settings.highContrast && { backgroundColor: '#1a1a1a', borderColor: '#FFF' }]}>
                  <ScrollView
                    style={styles.numberScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={[
                          styles.numberButton,
                          newReminder.hour === h && styles.numberButtonSelected,
                          settings.highContrast && { backgroundColor: newReminder.hour === h ? '#FFF' : '#1a1a1a', borderColor: '#FFF' },
                        ]}
                        onPress={() => setNewReminder({ ...newReminder, hour: h })}
                      >
                        <Text
                          style={[
                            styles.numberButtonText,
                            newReminder.hour === h && styles.numberButtonTextSelected,
                            settings.highContrast && { color: newReminder.hour === h ? '#000' : '#FFF', fontSize: getTextSize(14) },
                          ]}
                        >
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Minute Selector */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Minute</Text>
                <View style={[styles.numberButtonsContainer, settings.highContrast && { backgroundColor: '#1a1a1a', borderColor: '#FFF' }]}>
                  <ScrollView
                    style={styles.numberScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.numberButton,
                          newReminder.minute === m && styles.numberButtonSelected,
                          settings.highContrast && { backgroundColor: newReminder.minute === m ? '#FFF' : '#1a1a1a', borderColor: '#FFF' },
                        ]}
                        onPress={() => setNewReminder({ ...newReminder, minute: m })}
                      >
                        <Text
                          style={[
                            styles.numberButtonText,
                            newReminder.minute === m && styles.numberButtonTextSelected,
                            settings.highContrast && { color: newReminder.minute === m ? '#000' : '#FFF', fontSize: getTextSize(14) },
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Period Selector */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Period</Text>
                <View style={styles.periodButtons}>
                  {['AM', 'PM'].map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodButton,
                        newReminder.period === period && styles.periodButtonSelected,
                        settings.highContrast && { backgroundColor: newReminder.period === period ? '#FFF' : '#1a1a1a', borderColor: '#FFF' },
                      ]}
                      onPress={() => setNewReminder({ ...newReminder, period })}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          newReminder.period === period && styles.periodButtonTextSelected,
                          settings.highContrast && { color: newReminder.period === period ? '#000' : '#FFF', fontSize: getTextSize(14) },
                        ]}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.timePickerActions}>
              <Button
                mode="outlined"
                onPress={() => setTimePickerVisible(false)}
                style={[styles.timePickerActionButton, settings.highContrast && { borderColor: '#FFF' }]}
                labelStyle={[{ fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}
              >
                Done
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  reminderCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reminderInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reminderDescription: {
    fontSize: 14,
    color: colors.gray,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.success,
  },
  completedButton: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  deleteButton: {
    flex: 1,
    borderColor: colors.error,
  },
  allRemindersActions: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeChip: {
    backgroundColor: colors.lightGray,
  },
  statusChip: {
    backgroundColor: colors.lightGray,
  },
  chipText: {
    fontSize: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reminderTime: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  typeChip: {
    backgroundColor: colors.lightGray,
  },
  typeChipText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalForm: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  timePickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timePickerBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    height: 150,
  },
  timePickerActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  numberButtonsContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
  },
  numberScroll: {
    flex: 1,
  },
  numberButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  numberButtonSelected: {
    backgroundColor: colors.primary,
  },
  numberButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  numberButtonTextSelected: {
    color: colors.white,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  periodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  periodButtonTextSelected: {
    color: colors.white,
  },
  timePickerActionButton: {
    flex: 1,
  },
});

export default RemindersScreen;
