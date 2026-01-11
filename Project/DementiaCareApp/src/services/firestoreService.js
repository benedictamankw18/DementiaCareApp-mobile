/**
 * Firestore Service
 * Dementia Care Mobile Application
 * 
 * Handles all database operations (CRUD) for reminders, activities, and locations
 * 
 * Uses React Native Firebase (Native SDK)
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Create a new reminder
 * @param {object} reminderData - Reminder details (patientId, caregiverId, title, etc.)
 * @returns {Promise<string>} - ID of created reminder
 */
export const createReminder = async (reminderData) => {
  try {
    const docRef = await firestore()
      .collection('reminders')
      .add({
        ...reminderData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        isCompleted: false,
        completionCount: 0,
        missedCount: 0,
      });
    console.log('Reminder created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

/**
 * Get all reminders for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<array>} - Array of reminders
 */
export const getPatientReminders = async (patientId) => {
  try {
    const querySnapshot = await firestore()
      .collection('reminders')
      .where('patientId', '==', patientId)
      .get();
    
    const reminders = [];
    querySnapshot.forEach((doc) => {
      const reminder = { id: doc.id, ...doc.data() };
      // Filter for active reminders in memory (avoids composite index)
      if (reminder.isActive !== false) {
        reminders.push(reminder);
      }
    });
    
    // Sort by scheduledTime in memory
    reminders.sort((a, b) => {
      const timeA = a.scheduledTime?.toMillis?.() || 0;
      const timeB = b.scheduledTime?.toMillis?.() || 0;
      return timeA - timeB;
    });
    
    console.log('Fetched reminders for patient:', patientId, reminders.length);
    return reminders;
  } catch (error) {
    console.error('Error getting patient reminders:', error);
    // Return empty array on error to allow app to continue
    return [];
  }
};

/**
 * Update reminder status (mark as completed)
 * @param {string} reminderId - Reminder ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<void>}
 */
export const completeReminder = async (reminderId, patientId) => {
  try {
    await firestore()
      .collection('reminders')
      .doc(reminderId)
      .update({
        isCompleted: true,
        completedAt: firestore.FieldValue.serverTimestamp(),
      });

    // Log activity
    await logActivity({
      patientId: patientId,
      type: 'reminder_completed',
      title: 'Reminder Completed',
      reminderId: reminderId,
    });

    console.log('Reminder marked as completed:', reminderId);
  } catch (error) {
    console.error('Error completing reminder:', error);
    throw error;
  }
};

/**
 * Delete/Archive a reminder
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<void>}
 */
export const deleteReminder = async (reminderId) => {
  try {
    await firestore()
      .collection('reminders')
      .doc(reminderId)
      .update({
        isActive: false,
        deletedAt: firestore.FieldValue.serverTimestamp(),
      });
    console.log('Reminder deleted:', reminderId);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

/**
 * Log a patient activity
 * @param {object} activityData - Activity details (patientId, type, title, etc.)
 * @returns {Promise<string>} - ID of created activity
 */
export const logActivity = async (activityData) => {
  try {
    const docRef = await firestore()
      .collection('activities')
      .add({
        ...activityData,
        timestamp: firestore.FieldValue.serverTimestamp(),
        isDeleted: false,
      });
    console.log('Activity logged:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

/**
 * Get activity history for a patient
 * @param {string} patientId - Patient ID
 * @param {number} limitCount - Number of activities to fetch (default: 50)
 * @returns {Promise<array>} - Array of activities
 */
export const getPatientActivityHistory = async (patientId, limitCount = 50) => {
  try {
    const querySnapshot = await firestore()
      .collection('activities')
      .where('patientId', '==', patientId)
      .limit(limitCount * 2) // Fetch more to account for deleted items
      .get();
    
    const activities = [];
    querySnapshot.forEach((doc) => {
      const activity = { id: doc.id, ...doc.data() };
      // Filter out deleted activities
      if (!activity.isDeleted) {
        activities.push(activity);
      }
    });
    
    // Sort by timestamp descending on client side
    activities.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });
    
    console.log('Fetched activity history for patient:', patientId, activities.length);
    return activities.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting activity history:', error);
    return [];
  }
};

/**
 * Save GPS location
 * @param {object} locationData - Location coordinates (latitude, longitude, accuracy, etc.)
 * @returns {Promise<string>} - ID of created location record
 */
export const saveLocation = async (locationData) => {
  try {
    const docRef = await firestore()
      .collection('gps_locations')
      .add({
        ...locationData,
        timestamp: firestore.FieldValue.serverTimestamp(),
        consentVerified: true,
      });
    console.log('Location saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
};

/**
 * Get latest location for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} - Latest location data
 */
export const getLatestLocation = async (patientId) => {
  try {
    const querySnapshot = await firestore()
      .collection('gps_locations')
      .where('patientId', '==', patientId)
      .where('isDeleted', '==', false)
      .limit(10)
      .get();
    
    if (querySnapshot.empty) return null;

    // Client-side sorting to avoid composite index requirement
    const locations = [];
    querySnapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() });
    });

    locations.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return locations[0] || null;
    return null;
  } catch (error) {
    console.error('Error getting latest location:', error);
    return null;
  }
};

/**
 * Create SOS alert
 * @param {object} sosData - SOS details (patientId, location, caregivers to notify)
 * @returns {Promise<string>} - ID of SOS activity
 */
export const createSOSAlert = async (sosData) => {
  try {
    // Log the SOS event
    const sosActivityId = await logActivity({
      patientId: sosData.patientId,
      type: 'sos_triggered',
      title: 'Emergency SOS Triggered',
      category: 'emergency',
      metadata: {
        locationLatitude: sosData.latitude,
        locationLongitude: sosData.longitude,
        locationAccuracy: sosData.accuracy,
        notifiedCaregiverCount: sosData.caregivers?.length || 0,
      },
    });

    console.log('SOS alert created:', sosActivityId);
    return sosActivityId;
  } catch (error) {
    console.error('Error creating SOS alert:', error);
    throw error;
  }
};

export default {
  createReminder,
  getPatientReminders,
  completeReminder,
  deleteReminder,
  logActivity,
  getPatientActivityHistory,
  saveLocation,
  getLatestLocation,
  createSOSAlert,
};

/**
 * Save SOS Settings
 * @param {string} patientId - Patient ID
 * @param {object} sosSettings - SOS settings object
 * @returns {Promise<void>}
 */
export const saveSOSSettings = async (patientId, sosSettings) => {
  try {
    await firestore()
      .collection('patients')
      .doc(patientId)
      .set(
        {
          sosSettings: {
            ...sosSettings,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    console.log('[firestoreService:saveSOSSettings] Saved for patient:', patientId);
  } catch (error) {
    console.error('[firestoreService:saveSOSSettings] Error:', error);
    throw error;
  }
};

/**
 * Get SOS Settings
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} - SOS settings object
 */
export const getSOSSettings = async (patientId) => {
  try {
    const patientDoc = await firestore()
      .collection('patients')
      .doc(patientId)
      .get();

    if (patientDoc.exists) {
      const data = patientDoc.data();
      if (data && data.sosSettings) {
        console.log('[firestoreService:getSOSSettings] Fetched for patient:', patientId);
        return data.sosSettings;
      }
    }

    // Return default settings if none exist
    const defaultSettings = {
      enableSOS: true,
      requireConfirmation: true,
      sendLocation: true,
      sendNotification: true,
      sendMessage: false,
      vibrationPattern: true,
      soundAlert: true,
    };
    console.log('[firestoreService:getSOSSettings] No settings found, returning defaults for patient:', patientId);
    return defaultSettings;
  } catch (error) {
    console.error('[firestoreService:getSOSSettings] Error:', error);
    // Return defaults on error instead of throwing
    return {
      enableSOS: true,
      requireConfirmation: true,
      sendLocation: true,
      sendNotification: true,
      sendMessage: false,
      vibrationPattern: true,
      soundAlert: true,
    };
  }
};

/**
 * Save Emergency Contacts
 * @param {string} patientId - Patient ID
 * @param {array} contacts - Array of contact objects
 * @returns {Promise<void>}
 */
export const saveEmergencyContacts = async (patientId, contacts) => {
  try {
    await firestore()
      .collection('patients')
      .doc(patientId)
      .set(
        {
          emergencyContacts: contacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            relation: contact.relation,
          })),
          emergencyContactsUpdatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    console.log('[firestoreService:saveEmergencyContacts] Saved for patient:', patientId);
  } catch (error) {
    console.error('[firestoreService:saveEmergencyContacts] Error:', error);
    throw error;
  }
};

/**
 * Get Emergency Contacts
 * @param {string} patientId - Patient ID
 * @returns {Promise<array>} - Array of emergency contacts
 */
export const getEmergencyContacts = async (patientId) => {
  try {
    const patientDoc = await firestore()
      .collection('patients')
      .doc(patientId)
      .get();

    if (patientDoc.exists) {
      const data = patientDoc.data();
      if (data && data.emergencyContacts && Array.isArray(data.emergencyContacts)) {
        console.log('[firestoreService:getEmergencyContacts] Fetched for patient:', patientId);
        return data.emergencyContacts;
      }
    }

    // Return default contact if none exist
    console.log('[firestoreService:getEmergencyContacts] No contacts found, returning defaults for patient:', patientId);
    return [
      {
        id: '1',
        name: 'Primary Caregiver',
        phone: '+1 (555) 123-4567',
        relation: 'Caregiver',
      },
    ];
  } catch (error) {
    console.error('[firestoreService:getEmergencyContacts] Error:', error);
    // Return default contacts on error instead of throwing
    return [
      {
        id: '1',
        name: 'Primary Caregiver',
        phone: '+1 (555) 123-4567',
        relation: 'Caregiver',
      },
    ];
  }
};

/**
 * Save SOS Alert to Firestore
 * @param {string} patientId - Patient ID
 * @param {object} location - Location object with latitude and longitude
 * @returns {Promise<string>} - ID of created alert
 */
export const saveSOSAlert = async (patientId, location = null) => {
  try {
    // Get patient document to fetch assigned caregivers
    const patientDoc = await firestore()
      .collection('patients')
      .doc(patientId)
      .get();
    
    const patientData = patientDoc.data() || {};
    let caregiverIds = patientData.assignedCaregivers || [];
    
    // Try multiple fields for patient name (fullName is primary, fallback to others)
    let patientName = patientData.fullName || patientData.name || patientData.displayName || 'Patient';
    
    console.log('[firestoreService:saveSOSAlert] Patient data:', { patientId, patientName, assignedCaregivers: caregiverIds });

    // If no assigned caregivers in patient doc, fetch from caregiver relationships
    if (caregiverIds.length === 0) {
      console.log('[firestoreService:saveSOSAlert] No assigned caregivers found, fetching from relationships');
      const relationsSnapshot = await firestore()
        .collection('patientCaregiverRelations')
        .where('patientId', '==', patientId)
        .where('status', '==', 'active')
        .get();
      
      caregiverIds = relationsSnapshot.docs.map((doc) => doc.data().caregiverId).filter(Boolean);
      console.log('[firestoreService:saveSOSAlert] Fetched caregivers from relations:', caregiverIds);
    }

    const alertData = {
      patientId,
      patientName,
      timestamp: firestore.FieldValue.serverTimestamp(),
      status: 'active',
      type: 'sos',
      severity: 'critical',
      message: `${patientName} has triggered an emergency SOS alert`,
      caregiverIds,
    };

    // Add location if available
    if (location) {
      alertData.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      };
    }

    // Save to patient's sosAlerts collection
    const docRef = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('sosAlerts')
      .add(alertData);
    
    // Also save to alertLogs collection for caregiver dashboard
    await firestore()
      .collection('alertLogs')
      .add(alertData);

    console.log('[firestoreService:saveSOSAlert] Alert saved for patient:', patientId, 'Alert ID:', docRef.id, 'Caregivers notified:', caregiverIds);
    return docRef.id;
  } catch (error) {
    console.error('[firestoreService:saveSOSAlert] Error saving SOS alert:', error);
    throw error;
  }
};
