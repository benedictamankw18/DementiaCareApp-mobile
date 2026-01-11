import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, FlatList, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { t } from '../../services/i18nService';

const hoursData = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutesData = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const periodsData = ['AM', 'PM'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: 8 },
  sectionTitle: { marginBottom: spacing.lg, color: colors.text },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  timeInputButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.lightGray, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.background, marginBottom: spacing.lg },
  timeInputText: { flex: 1, fontSize: 16, color: colors.text, marginLeft: spacing.md },
  helperText: { fontSize: 12, color: colors.gray, marginTop: spacing.md },
  footer: { padding: spacing.lg },
  button: { marginTop: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  pickerContainer: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: spacing.lg, maxHeight: '80%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  pickersRow: { flexDirection: 'row', justifyContent: 'space-around', height: 250, paddingVertical: spacing.md },
  pickerColumn: { flex: 1, paddingHorizontal: spacing.sm },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: colors.gray, textAlign: 'center', marginBottom: spacing.sm },
  pickerItem: { paddingVertical: spacing.sm, justifyContent: 'center', alignItems: 'center' },
  pickerItemSelected: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.md },
  pickerItemText: { fontSize: 18, color: colors.text, fontWeight: '500' },
  pickerItemTextSelected: { color: colors.white, fontWeight: '600' },
  periodPicker: { justifyContent: 'center', gap: spacing.sm },
  periodButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.lightGray, alignItems: 'center' },
  periodButtonSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodButtonText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  periodButtonTextSelected: { color: colors.white },
  pickerFooter: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md },
  pickerButton: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

function TimePickerModal(props) {
  const { visible, onClose, time, onTimeChange, themeColors } = props;
  const [tempHours, setTempHours] = useState(time && time.hours ? time.hours : '08');
  const [tempMinutes, setTempMinutes] = useState(time && time.minutes ? time.minutes : '00');
  const [tempPeriod, setTempPeriod] = useState(time && time.period ? time.period : 'AM');

  const handleConfirm = () => {
    onTimeChange({ hours: tempHours, minutes: tempMinutes, period: tempPeriod });
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerContainer, { backgroundColor: themeColors?.surface || colors.white }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: themeColors?.lightGray || colors.lightGray }]}>
            <Text style={[styles.pickerTitle, { color: themeColors?.text || colors.text }]}>{t('notifications.selectTime')}</Text>
            <Pressable onPress={onClose}>
              <Icon name="close" size={24} color={themeColors?.primary || colors.primary} />
            </Pressable>
          </View>
          <View style={styles.pickersRow}>
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: themeColors?.textSecondary || colors.gray }]}>{t('notifications.hour')}</Text>
              <FlatList
                data={hoursData}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setTempHours(item)}
                    style={[styles.pickerItem, tempHours === item && { ...styles.pickerItemSelected, backgroundColor: themeColors?.primary || colors.primary }]}
                  >
                    <Text style={[styles.pickerItemText, tempHours === item && { ...styles.pickerItemTextSelected, color: themeColors?.white || colors.white }]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
              />
            </View>
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: themeColors?.textSecondary || colors.gray }]}>{t('notifications.minute')}</Text>
              <FlatList
                data={minutesData}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setTempMinutes(item)}
                    style={[styles.pickerItem, tempMinutes === item && { ...styles.pickerItemSelected, backgroundColor: themeColors?.primary || colors.primary }]}
                  >
                    <Text style={[styles.pickerItemText, tempMinutes === item && { ...styles.pickerItemTextSelected, color: themeColors?.white || colors.white }]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
              />
            </View>
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: themeColors?.textSecondary || colors.gray }]}>{t('notifications.period')}</Text>
              <View style={styles.periodPicker}>
                {periodsData.map((period) => (
                  <Pressable
                    key={period}
                    onPress={() => setTempPeriod(period)}
                    style={[styles.periodButton, tempPeriod === period && { ...styles.periodButtonSelected, backgroundColor: themeColors?.primary || colors.primary, borderColor: themeColors?.primary || colors.primary }]}
                  >
                    <Text style={[styles.periodButtonText, { color: themeColors?.text || colors.text }, tempPeriod === period && { ...styles.periodButtonTextSelected, color: themeColors?.white || colors.white }]}>
                      {period}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.pickerFooter}>
            <Button mode="outlined" onPress={onClose} style={styles.pickerButton}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" onPress={handleConfirm} style={styles.pickerButton}>
              {t('common.ok')}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function NotificationTimeScreen(props) {
  const { navigation } = props;
  const { colors: themeColors } = useTheme();
  const [startTime, setStartTime] = useState({ hours: '08', minutes: '00', period: 'AM' });
  const [endTime, setEndTime] = useState({ hours: '09', minutes: '00', period: 'PM' });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationTime();
  }, []);

  const loadNotificationTime = async () => {
    try {
      const savedTime = await AsyncStorage.getItem('preference_notificationTime');
      if (savedTime) {
        console.log('[NotificationTimeScreen] Loaded notification time from localStorage:', savedTime);
        
        // Parse saved time string: "08:00 AM - 09:00 PM"
        const [startStr, endStr] = savedTime.split(' - ');
        
        if (startStr && endStr) {
          // Parse start time
          const [startHours, startMinutes, startPeriod] = startStr.trim().split(/[\s:]+/);
          setStartTime({
            hours: startHours,
            minutes: startMinutes,
            period: startPeriod,
          });
          
          // Parse end time
          const [endHours, endMinutes, endPeriod] = endStr.trim().split(/[\s:]+/);
          setEndTime({
            hours: endHours,
            minutes: endMinutes,
            period: endPeriod,
          });
          
          console.log('[NotificationTimeScreen] Parsed start time:', { hours: startHours, minutes: startMinutes, period: startPeriod });
          console.log('[NotificationTimeScreen] Parsed end time:', { hours: endHours, minutes: endMinutes, period: endPeriod });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('[NotificationTimeScreen] Error loading notification time:', error);
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    return time.hours + ':' + time.minutes + ' ' + time.period;
  };

  const validateTimeInterval = () => {
    // Convert times to minutes from midnight
    let startMinutes = parseInt(startTime.hours) * 60 + parseInt(startTime.minutes);
    let endMinutes = parseInt(endTime.hours) * 60 + parseInt(endTime.minutes);
    
    // Adjust for AM/PM
    if (startTime.period === 'PM' && startTime.hours !== '12') {
      startMinutes += 12 * 60;
    }
    if (startTime.hours === '12' && startTime.period === 'AM') {
      startMinutes -= 12 * 60; // 12 AM = 0 hours
    }
    
    if (endTime.period === 'PM' && endTime.hours !== '12') {
      endMinutes += 12 * 60;
    }
    if (endTime.hours === '12' && endTime.period === 'AM') {
      endMinutes -= 12 * 60; // 12 AM = 0 hours
    }
    
    // If end time is before start time, it's next day
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const difference = endMinutes - startMinutes;
    console.log('[NotificationTimeScreen] Time validation - Start:', startMinutes, 'End:', endMinutes, 'Difference:', difference, 'minutes');
    
    return difference >= 1; // At least 1 minute
  };

  const handleSave = async () => {
    try {
      // Validate time interval
      if (!validateTimeInterval()) {
        Alert.alert(t('notifications.invalidTimeRange'), t('notifications.endTimeAfterStart'));
        return;
      }

      const timeString = `${formatTime(startTime)} - ${formatTime(endTime)}`;
      
      // Save to local storage
      await AsyncStorage.setItem('preference_notificationTime', timeString);
      console.log('[NotificationTimeScreen] Saved notification time to localStorage:', timeString);

      // Also save to Firestore
      const currentUser = auth().currentUser;
      if (currentUser?.uid) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .set({ preference_notificationTime: timeString }, { merge: true });
        console.log('[NotificationTimeScreen] Saved notification time to Firestore:', timeString);
      }

      Alert.alert(t('common.success'), t('notifications.saved'));
      navigation.goBack();
    } catch (error) {
      console.error('[NotificationTimeScreen] Error saving notification time:', error);
      Alert.alert(t('common.error'), t('notifications.failedToSave'));
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
            <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>{t('notifications.schedule')}</Text>
            <Text style={[styles.label, { color: themeColors.text }]}>{t('notifications.startTime')}</Text>
            <Pressable
              onPress={() => setShowStartPicker(true)}
              style={[styles.timeInputButton, { borderColor: themeColors.lightGray, backgroundColor: themeColors.background }]}
            >
              <Icon name="clock-outline" size={20} color={themeColors.primary} />
              <Text style={[styles.timeInputText, { color: themeColors.text }]}>{formatTime(startTime)}</Text>
              <Icon name="chevron-down" size={20} color={themeColors.primary} />
            </Pressable>
            <Text style={[styles.label, { marginTop: spacing.lg, color: themeColors.text }]}>{t('notifications.endTime')}</Text>
            <Pressable
              onPress={() => setShowEndPicker(true)}
              style={[styles.timeInputButton, { borderColor: themeColors.lightGray, backgroundColor: themeColors.background }]}
            >
              <Icon name="clock-outline" size={20} color={themeColors.primary} />
              <Text style={[styles.timeInputText, { color: themeColors.text }]}>{formatTime(endTime)}</Text>
              <Icon name="chevron-down" size={20} color={themeColors.primary} />
            </Pressable>
            <Text style={[styles.helperText, { color: themeColors.textSecondary }]}>{t('notifications.helperText')}</Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.footer}>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          {t('profile.saveChanges')}
        </Button>
      </View>
      <TimePickerModal
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        time={startTime}
        onTimeChange={setStartTime}
        themeColors={themeColors}
      />
      <TimePickerModal
        visible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        time={endTime}
        onTimeChange={setEndTime}
        themeColors={themeColors}
      />
    </ScrollView>
  );
}

export default NotificationTimeScreen;
