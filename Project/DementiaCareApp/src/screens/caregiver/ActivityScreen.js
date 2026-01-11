/**
 * Patient Activity Screen
 * Dementia Care Mobile Application
 * 
 * Shows activity logs, reminders completed, and health data for a specific patient
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, SegmentedButtons, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { getPatientActivityHistory, getPatientReminders, logActivity, createReminder } from '../../services/firestoreService';
import { t } from '../../services/i18nService';
import firestore from '@react-native-firebase/firestore';

const PatientActivityScreen = ({ navigation, route }) => {
  const { patientId, patientName } = route?.params || {};
  const { colors: themeColors } = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', description: '', type: 'other' });
  const [newReminder, setNewReminder] = useState({ title: '', description: '', type: 'medication', hour: 9, minute: 0, period: 'AM' });
  const activityTypes = ['medication', 'meal', 'exercise', 'appointment', 'other'];

  useEffect(() => {
    navigation.setOptions({
      title: patientName ? `${patientName}'s Activity` : 'Patient Activity',
    });
    loadActivities();
  }, [patientName, navigation]);

  useEffect(() => {
    // Reload activities when filter changes
    loadActivities();
  }, [filterType]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Helper function to format timestamps
      const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'recently';
        
        const now = new Date();
        const pastTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffMs = now - pastTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return 'a week ago';
      };

      // Helper to get icon for activity type
      const getActivityIcon = (activityType) => {
        switch (activityType) {
          case 'medication': return 'pill';
          case 'meal': return 'food-apple';
          case 'exercise': return 'dumbbell';
          case 'appointment': return 'calendar-check';
          case 'reminder': return 'bell';
          default: return 'circle';
        }
      };

      // Get all reminders as "today's goals"
      const reminders = await getPatientReminders(patientId);
      const reminderActivities = reminders.map(reminder => ({
        id: reminder.id,
        type: 'reminder',
        title: reminder.title,
        description: reminder.description || 'Reminder',
        timestamp: reminder.createdAt,
        status: reminder.isCompleted ? 'completed' : 'pending',
        icon: getActivityIcon(reminder.type || 'reminder'),
        color: reminder.isCompleted ? colors.success : colors.warning,
      }));

      // Get activity history
      let activities = await getPatientActivityHistory(patientId, 50);
      const activityCards = activities.map(activity => ({
        id: activity.id,
        type: 'activity',
        title: activity.title || activity.type,
        description: activity.description || 'Activity logged',
        timestamp: activity.timestamp,
        status: 'completed',
        icon: getActivityIcon(activity.type),
        color: colors.primary,
      }));

      // Combine and filter
      let combined = [...reminderActivities, ...activityCards];

      // Apply date filter
      const now = new Date();
      if (filterType === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        combined = combined.filter(item => {
          const itemDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
          return itemDate >= today;
        });
      } else if (filterType === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        combined = combined.filter(item => {
          const itemDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
          return itemDate >= weekAgo;
        });
      }

      // Sort by timestamp descending
      combined.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });

      // Add formatted time
      const activitiesWithTime = combined.map(item => ({
        ...item,
        displayTime: formatTimeAgo(item.timestamp),
      }));

      setActivities(activitiesWithTime);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert(t('common.error'), t('activity.failedToAdd'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.title.trim()) {
      Alert.alert(t('activity.validationError'), t('activity.pleaseEnterTitle'));
      return;
    }

    try {
      await logActivity({
        patientId,
        title: newActivity.title,
        description: newActivity.description,
        type: newActivity.type,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert(t('activity.success'), t('activity.addActivitySuccess'));
      setNewActivity({ title: '', description: '', type: 'other' });
      setActivityModalVisible(false);
      loadActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert(t('common.error'), t('activity.failedToAdd'));
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert(t('activity.validationError'), t('activity.pleaseEnterReminderTitle'));
      return;
    }

    try {
      // Convert 12-hour to 24-hour format
      let hour24 = parseInt(newReminder.hour);
      if (newReminder.period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (newReminder.period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }

      await createReminder({
        patientId,
        title: newReminder.title,
        description: newReminder.description,
        type: newReminder.type,
        time: `${String(hour24).padStart(2, '0')}:${String(newReminder.minute).padStart(2, '0')}`,
      });
      Alert.alert(t('activity.success'), t('activity.createReminderSuccess'));
      setNewReminder({ title: '', description: '', type: 'medication', hour: 9, minute: 0, period: 'AM' });
      setReminderModalVisible(false);
      loadActivities();
    } catch (error) {
      console.error('Error adding reminder:', error);
      Alert.alert(t('common.error'), t('activity.failedToCreate'));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getTimeString = (timestamp) => {
    if (!timestamp) return 'recently';
    
    const now = new Date();
    const pastTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - pastTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'a week ago';
  };

  const ActivityCard = ({ item, themeColors }) => (
    <Card style={[styles.activityCard, { backgroundColor: themeColors.surface }]}>
      <Card.Content>
        <View style={styles.activityRow}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Icon name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.activityContent}>
            <Text style={[typography.heading4, { color: themeColors.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: themeColors.textSecondary }]}>{item.description}</Text>
            <Text style={[styles.timestamp, { color: themeColors.textLight }]}>{item.displayTime}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Icon
              name={item.status === 'completed' ? 'check-circle' : item.status === 'pending' ? 'clock' : 'record'}
              size={20}
              color={item.status === 'completed' ? colors.success : item.status === 'pending' ? colors.warning : themeColors.primary}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        scrollEnabled={true}
      >
        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            buttons={[
              { value: 'today', label: t('activity.today') },
              { value: 'week', label: t('activity.week') },
              { value: 'all', label: t('activity.allTime') },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Activities List */}
        <View style={styles.section}>
          {activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="folder-open" size={48} color={themeColors.textSecondary} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{t('activity.noActivities')}</Text>
            </View>
          ) : (
            activities.map((activity) => (
              <ActivityCard key={activity.id} item={activity} themeColors={themeColors} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Menu */}
      <FAB.Group
        open={menuModalVisible}
        onStateChange={({ open }) => setMenuModalVisible(open)}
        icon="plus"
        actions={[
          {
            icon: 'check-circle',
            label: t('activity.logActivity'),
            onPress: () => {
              setMenuModalVisible(false);
              setActivityModalVisible(true);
            },
          },
          {
            icon: 'bell',
            label: t('activity.createReminder'),
            onPress: () => {
              setMenuModalVisible(false);
              setReminderModalVisible(true);
            },
          },
        ]}
      />

      {/* Add Activity Modal */}
      <Modal
        visible={activityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActivityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.lightGray }]}>
              <Text style={[typography.heading3, { color: themeColors.text }]}>{t('activity.logActivity')}</Text>
              <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                <Icon name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: themeColors.text }]}>{t('activity.activityTitle')} *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.lightGray }]}
                placeholder={t('activity.placeholderMorningWalk')}
                placeholderTextColor={themeColors.textLight}
                value={newActivity.title}
                onChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
              />
              

              <Text style={[styles.label, { color: themeColors.text }]}>{t('activity.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.lightGray }]}
                placeholder={t('activity.placeholderAddDetails')}
                placeholderTextColor={themeColors.textLight}
                value={newActivity.description}
                onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
                multiline
                numberOfLines={4}
              />

              <Text style={[styles.label, { color: themeColors.text }]}>{t('activity.activityType')}</Text>
              <View style={styles.typeButtonsContainer}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { borderColor: themeColors.lightGray, backgroundColor: themeColors.surface },
                      newActivity.type === type && { backgroundColor: themeColors.primary },
                    ]}
                    onPress={() => setNewActivity({ ...newActivity, type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: themeColors.text },
                        newActivity.type === type && { color: themeColors.white },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: themeColors.background, borderTopColor: themeColors.lightGray }]}>
              <Button
                mode="outlined"
                onPress={() => setActivityModalVisible(false)}
                style={styles.footerButton}
              >
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddActivity}
                style={styles.footerButton}
              >
                {t('activity.addActivity')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Reminder Modal */}
      <Modal
        visible={reminderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.lightGray }]}>
              <Text style={[typography.heading3, { color: themeColors.text }]}>{t('activity.createReminder')}</Text>
              <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
                <Icon name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: themeColors.text }]}>{t('activity.reminderTitle')} *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.lightGray }]}
                placeholderTextColor={themeColors.textLight}
                placeholder={t('activity.placeholderReminder')}
                value={newReminder.title}
                onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
              />

              <Text style={[styles.label, { color: themeColors.text }]}>{t('activity.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.lightGray }]}
                placeholder={t('activity.placeholderReminderDetails')}
                placeholderTextColor={themeColors.textLight}
                value={newReminder.description}
                onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.label, { color: themeColors.text }]}>{t('activity.reminderType')}</Text>
              <View style={styles.typeButtonsContainer}>
                {['medication', 'meal', 'exercise', 'appointment'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { borderColor: themeColors.lightGray, backgroundColor: themeColors.surface },
                      newReminder.type === type && { backgroundColor: themeColors.primary },
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: themeColors.text },
                        newReminder.type === type && { color: themeColors.white },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: themeColors.text }]}>Time</Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeLabel, { color: themeColors.text }]}>Hour</Text>
                  <ScrollView horizontal={false} style={styles.timePicker}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timePickerButton,
                          { borderColor: themeColors.lightGray },
                          newReminder.hour === hour && { backgroundColor: themeColors.primary },
                        ]}
                        onPress={() => setNewReminder({ ...newReminder, hour })}
                      >
                        <Text
                          style={[
                            styles.timePickerButtonText,
                            { color: themeColors.text },
                            newReminder.hour === hour && { color: themeColors.white },
                          ]}
                        >
                          {String(hour).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.timeColumn}>
                  <Text style={[styles.timeLabel, { color: themeColors.text }]}>Minute</Text>
                  <ScrollView horizontal={false} style={styles.timePicker}>
                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timePickerButton,
                          { borderColor: themeColors.lightGray },
                          newReminder.minute === minute && { backgroundColor: themeColors.primary },
                        ]}
                        onPress={() => setNewReminder({ ...newReminder, minute })}
                      >
                        <Text
                          style={[
                            styles.timePickerButtonText,
                            { color: themeColors.text },
                            newReminder.minute === minute && { color: themeColors.white },
                          ]}
                        >
                          {String(minute).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.timeColumn}>
                  <Text style={[styles.timeLabel, { color: themeColors.text }]}>Period</Text>
                  <View style={styles.periodButtons}>
                    {['AM', 'PM'].map((period) => (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.periodButton,
                          { borderColor: themeColors.lightGray, backgroundColor: themeColors.surface },
                          newReminder.period === period && { backgroundColor: themeColors.primary },
                        ]}
                        onPress={() => setNewReminder({ ...newReminder, period })}
                      >
                        <Text
                          style={[
                            styles.periodButtonText,
                            { color: themeColors.text },
                            newReminder.period === period && { color: themeColors.white },
                          ]}
                        >
                          {period}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: themeColors.background, borderTopColor: themeColors.lightGray }]}>
              <Button
                mode="outlined"
                onPress={() => setReminderModalVisible(false)}
                style={styles.footerButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddReminder}
                style={styles.footerButton}
              >
                Create Reminder
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
    backgroundColor: colors.background,
  },
  filterSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  segmentedButtons: {
    width: '100%',
  },
  section: {
    padding: spacing.lg,
  },
  activityCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  timestamp: {
    fontSize: 11,
    color: colors.lightGray,
    marginTop: spacing.xs,
  },
  statusBadge: {
    marginLeft: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.md,
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
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
    height: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  timePicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  timePickerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerButtonActive: {
    backgroundColor: colors.primary,
  },
  timePickerButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  timePickerButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  periodButtons: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  periodButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerButton: {
    flex: 1,
  },
});

export default PatientActivityScreen;
