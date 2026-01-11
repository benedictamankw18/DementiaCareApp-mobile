/**
 * Activities Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Shows patient's activity history and daily tasks
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Text, Chip, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { getPatientActivityHistory } from '../../services/firestoreService';
import { getPatientReminders } from '../../services/firestoreService';
import auth from '@react-native-firebase/auth';

const ActivitiesScreen = ({ route }) => {
  const { getTextSize, settings } = useSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoals, setDailyGoals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activityStats, setActivityStats] = useState({
    medications: 0,
    exercises: 0,
    meals: 0,
    appointments: 0,
  });

  const currentUser = auth().currentUser;
  const patientId = route.params?.patientId || currentUser?.uid;

  // Load reminders and activities
  const loadData = async () => {
    try {
      // Fetch reminders for today (will serve as daily goals)
      const reminders = await getPatientReminders(patientId);
      
      // Map reminders to daily goals format
      const todayReminders = reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        completed: reminder.isCompleted || false,
        time: reminder.displayTime || reminder.time,
        type: reminder.type,
      }));

      setDailyGoals(todayReminders);

      // Fetch activity history
      const activities = await getPatientActivityHistory(patientId, 50);
      
      // Filter out system events (reminder_completed, etc) and count actual activities
      const realActivities = activities.filter(activity => 
        activity.type !== 'reminder_completed' && !activity.isDeleted
      );
      
      // Calculate statistics for the week
      const stats = {
        medications: 0,
        exercises: 0,
        meals: 0,
        appointments: 0,
      };

      realActivities.forEach((activity) => {
        if (activity.type === 'medication') stats.medications++;
        else if (activity.type === 'exercise') stats.exercises++;
        else if (activity.type === 'meal') stats.meals++;
        else if (activity.type === 'appointment') stats.appointments++;
      });

      setActivityStats(stats);
      
      // Map activities to display format
      const formattedActivities = realActivities.slice(0, 10).map((activity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        time: formatTimeAgo(activity.timestamp),
        icon: getActivityIcon(activity.type),
      }));

      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format timestamp to "X hours/minutes ago"
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'recently';
    
    const now = new Date();
    const activityTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return 'a week ago';
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'medication':
        return 'pill';
      case 'exercise':
        return 'walk';
      case 'social':
        return 'video';
      case 'meal':
        return 'food-apple';
      case 'activity':
        return 'gamepad-variant';
      case 'appointment':
        return 'calendar-check';
      default:
        return 'history';
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, settings.highContrast && { backgroundColor: '#000' }]}>
        <Text style={[{ color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Loading activities...</Text>
      </View>
    );
  }

  const completedCount = dailyGoals.filter(g => g.completed).length;
  const progress = dailyGoals.length > 0 ? completedCount / dailyGoals.length : 0;

  const getActivityColor = (type) => {
    switch (type) {
      case 'medication':
        return colors.error;
      case 'exercise':
        return colors.success;
      case 'social':
        return colors.primary;
      case 'meal':
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  return (
    <ScrollView
      style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Progress Card */}
      <Card style={[styles.progressCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.progressTitle, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Today's Progress</Text>
              <Text style={[styles.progressSubtitle, { fontSize: getTextSize(14), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>
                {completedCount} of {dailyGoals.length} tasks completed
              </Text>
            </View>
            <View style={[styles.percentageCircle, { backgroundColor: colors.primary }, settings.highContrast && { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FFF' }]}>
              <Text style={[styles.percentageText, { color: colors.white }, settings.highContrast && { color: '#000' }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={progress}
            color={colors.success}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* Daily Goals */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Today's Goals</Text>
        {dailyGoals.length > 0 ? (
          dailyGoals.map((goal) => (
            <Card key={goal.id} style={[styles.goalCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
              <Card.Content>
                <View style={styles.goalRow}>
                  <View style={styles.checkboxContainer}>
                    <Icon
                      name={goal.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={32}
                      color={goal.completed ? colors.success : (settings.highContrast ? '#FFF' : colors.textSecondary)}
                    />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[
                      styles.goalTitle,
                      { fontSize: getTextSize(16), color: colors.text },
                      goal.completed && styles.completedText,
                      settings.highContrast && { color: '#FFF' }
                    ]}>
                      {goal.title}
                    </Text>
                    <Text style={[styles.goalTime, { fontSize: getTextSize(14), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>{goal.time}</Text>
                  </View>
                  {goal.completed && (
                    <Chip
                      icon="check"
                      style={styles.completedChip}
                      textStyle={styles.completedChipText}
                    >
                      Done
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={[styles.emptyCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="calendar-check" size={64} color={settings.highContrast ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.emptyText, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>No reminders for today</Text>
                <Text style={[styles.emptySubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>You're all set!</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getTextSize(16) }, settings.highContrast && { color: '#FFF' }]}>Recent Activities</Text>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <Card key={activity.id} style={[styles.activityCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
              <Card.Content>
                <View style={styles.activityRow}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: getActivityColor(activity.type) + (settings.highContrast ? '' : '20') }
                    ]}
                  >
                    <Icon
                      name={activity.icon}
                      size={24}
                      color={getActivityColor(activity.type)}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { fontSize: getTextSize(16) }, settings.highContrast && { color: '#FFF' }]}>{activity.title}</Text>
                    <Text style={[styles.activityTime, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>{activity.time}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={[styles.emptyCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="history" size={64} color={settings.highContrast ? '#FFF' : colors.gray} />
                <Text style={[styles.emptyText, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>No activities yet</Text>
                <Text style={[styles.emptySubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>Activities will appear here</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Stats Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getTextSize(16) }, settings.highContrast && { color: '#FFF' }]}>This Week</Text>
        <Card style={[styles.statsCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="pill" size={32} color={colors.error} />
                <Text style={[styles.statNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{activityStats.medications}</Text>
                <Text style={[styles.statLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Medications</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="walk" size={32} color={colors.success} />
                <Text style={[styles.statNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{activityStats.exercises}</Text>
                <Text style={[styles.statLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="food" size={32} color={colors.warning} />
                <Text style={[styles.statNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{activityStats.meals}</Text>
                <Text style={[styles.statLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Meals</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="calendar-check" size={32} color={colors.primary} />
                <Text style={[styles.statNumber, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>{activityStats.appointments}</Text>
                <Text style={[styles.statLabel, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>Appointments</Text>
              </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  progressCard: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  percentageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
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
  goalCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 1,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray,
  },
  goalTime: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  completedChip: {
    backgroundColor: colors.success + '20',
  },
  completedChipText: {
    color: colors.success,
    fontSize: 12,
  },
  activityCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityTime: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
});

export default ActivitiesScreen;
