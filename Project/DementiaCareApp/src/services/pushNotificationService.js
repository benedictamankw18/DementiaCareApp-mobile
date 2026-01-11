/**
 * Push Notification Service
 * Dementia Care Mobile Application
 * 
 * Service for Firebase Cloud Messaging (FCM) setup and notification handling
 */

import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

/**
 * Initialize push notifications
 * Request user permission and setup notification handlers
 * @param {string} userId - The current user's ID
 * @returns {Promise<boolean>} Success status
 */
export const initializePushNotifications = async (userId) => {
  try {
    console.log('[initializePushNotifications] Setting up FCM for user:', userId);

    // Request user permission for notifications
    const authorizationStatus = await messaging().requestPermission();
    
    if (
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      console.log('[initializePushNotifications] User authorized notifications');

      // Get FCM token
      const token = await messaging().getToken();
      console.log('[initializePushNotifications] FCM Token:', token);

      // Save token to Firestore (user type determined by collection)
      await saveDeviceToken(userId, token);

      // Handle foreground messages
      const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        handleForegroundNotification(remoteMessage);
      });

      // Handle notification click from background/quit state
      messaging().onNotificationOpenedApp((remoteMessage) => {
        handleBackgroundNotificationClick(remoteMessage);
      });

      // Handle app opened from notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        handleBackgroundNotificationClick(initialNotification);
      }

      // Handle token refresh
      const unsubscribeTokenRefresh = messaging().onTokenRefresh((token) => {
        console.log('[initializePushNotifications] Token refreshed:', token);
        saveDeviceToken(userId, token);
      });

      console.log('[initializePushNotifications] Push notifications initialized successfully');
      return true;
    } else {
      console.warn('[initializePushNotifications] Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('[initializePushNotifications] Error:', error);
    return false;
  }
};

/**
 * Save device token to Firestore
 * @param {string} userId - The user's ID
 * @param {string} token - FCM device token
 * @returns {Promise<boolean>} Success status
 */
export const saveDeviceToken = async (userId, token) => {
  try {
    // Try to determine if user is patient or caregiver by checking both collections
    const patientDoc = await firestore().collection('patients').doc(userId).get();
    const caregiverDoc = await firestore().collection('caregivers').doc(userId).get();

    if (patientDoc.exists) {
      // User is a patient
      await firestore()
        .collection('patients')
        .doc(userId)
        .update({
          deviceTokens: firestore.FieldValue.arrayUnion(token),
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
        });
      console.log('[saveDeviceToken] Token saved for patient');
    } else if (caregiverDoc.exists) {
      // User is a caregiver
      await firestore()
        .collection('caregivers')
        .doc(userId)
        .update({
          deviceTokens: firestore.FieldValue.arrayUnion(token),
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
        });
      console.log('[saveDeviceToken] Token saved for caregiver');
    } else {
      // Create new entry if doesn't exist
      console.warn('[saveDeviceToken] User document not found, skipping token save');
    }

    return true;
  } catch (error) {
    console.error('[saveDeviceToken] Error:', error);
    return false;
  }
};

/**
 * Handle notification received while app is in foreground
 * @param {Object} remoteMessage - The message object from FCM
 */
const handleForegroundNotification = (remoteMessage) => {
  console.log('[handleForegroundNotification] Notification:', remoteMessage);

  const { notification, data } = remoteMessage;

  // Show local notification or update UI
  // This can be customized based on notification type
  if (notification) {
    console.log('Title:', notification.title);
    console.log('Body:', notification.body);
  }

  // Handle custom data
  if (data) {
    console.log('Data:', data);
    handleNotificationData(data);
  }
};

/**
 * Handle notification click from background/quit state
 * @param {Object} remoteMessage - The message object from FCM
 */
const handleBackgroundNotificationClick = (remoteMessage) => {
  console.log('[handleBackgroundNotificationClick] Notification:', remoteMessage);

  const { data } = remoteMessage;

  if (data) {
    handleNotificationData(data);
  }
};

/**
 * Process notification data and perform relevant actions
 * @param {Object} data - Notification data payload
 */
const handleNotificationData = (data) => {
  console.log('[handleNotificationData] Processing:', data);

  // Handle different notification types
  switch (data.type) {
    case 'sos':
      console.log('[handleNotificationData] SOS Alert - Patient:', data.patientId);
      // Navigate to SOS alert screen or show modal
      break;
    case 'reminder':
      console.log('[handleNotificationData] Reminder - Reminder ID:', data.reminderId);
      // Navigate to reminders or show reminder notification
      break;
    case 'alert':
      console.log('[handleNotificationData] General Alert:', data.message);
      // Handle general alert
      break;
    default:
      console.log('[handleNotificationData] Unknown notification type:', data.type);
  }
};

/**
 * Send a test notification to a device
 * @param {string} deviceToken - Target device token
 * @param {Object} notification - Notification object
 * @returns {Promise<boolean>} Success status
 */
export const sendTestNotification = async (deviceToken, notification) => {
  try {
    console.log('[sendTestNotification] Sending test notification to:', deviceToken);

    // This would be done server-side in production
    // Keeping as reference for backend implementation
    console.log('[sendTestNotification] Notification payload:', notification);

    return true;
  } catch (error) {
    console.error('[sendTestNotification] Error:', error);
    return false;
  }
};

/**
 * Subscribe to notification topic
 * @param {string} topic - Topic name
 * @returns {Promise<boolean>} Success status
 */
export const subscribeToTopic = async (topic) => {
  try {
    console.log('[subscribeToTopic] Subscribing to topic:', topic);
    await messaging().subscribeToTopic(topic);
    console.log('[subscribeToTopic] Successfully subscribed');
    return true;
  } catch (error) {
    console.error('[subscribeToTopic] Error:', error);
    return false;
  }
};

/**
 * Unsubscribe from notification topic
 * @param {string} topic - Topic name
 * @returns {Promise<boolean>} Success status
 */
export const unsubscribeFromTopic = async (topic) => {
  try {
    console.log('[unsubscribeFromTopic] Unsubscribing from topic:', topic);
    await messaging().unsubscribeFromTopic(topic);
    console.log('[unsubscribeFromTopic] Successfully unsubscribed');
    return true;
  } catch (error) {
    console.error('[unsubscribeFromTopic] Error:', error);
    return false;
  }
};

export default {
  initializePushNotifications,
  saveDeviceToken,
  sendTestNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
};
