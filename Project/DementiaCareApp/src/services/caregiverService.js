/**
 * Caregiver Service
 * Dementia Care Mobile Application
 * 
 * Service for caregiver-related Firestore queries
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Fetch all patients assigned to a caregiver
 * @param {string} caregiverId - The caregiver's user ID
 * @returns {Promise<Array>} Array of patient objects
 */
export const getCaregiverPatients = async (caregiverId) => {
  try {
    console.log('[getCaregiverPatients] Fetching patients for caregiver:', caregiverId);
    
    // Query caregiver_relationships collection for active relationships
    const relationshipsSnapshot = await firestore()
      .collection('caregiver_relationships')
      .where('caregiverId', '==', caregiverId)
      .where('status', '==', 'active')
      .get();
    
    if (relationshipsSnapshot.empty) {
      console.log('[getCaregiverPatients] No patients found');
      return [];
    }
    
    const patients = [];
    
    // Fetch patient details for each relationship
    for (const doc of relationshipsSnapshot.docs) {
      const relationship = doc.data();
      const patientId = relationship.patientId;
      
      try {
        const patientDoc = await firestore()
          .collection('users')
          .doc(patientId)
          .get();
        
        if (patientDoc.exists) {
          patients.push({
            id: patientId,
            ...patientDoc.data(),
            relationshipId: doc.id,
            relationshipType: relationship.relationshipType,
            primaryCaregiver: relationship.primaryCaregiver,
            permissions: relationship.permissions,
          });
        }
      } catch (err) {
        console.error('[getCaregiverPatients] Error fetching patient:', patientId, err);
      }
    }
    
    return patients;
  } catch (error) {
    console.error('[getCaregiverPatients] Error:', error);
    return [];
  }
};

/**
 * Fetch activities for a specific patient
 * @param {string} patientId - The patient's ID
 * @param {string} filter - Filter type: 'today', 'week', or 'all'
 * @returns {Promise<Array>} Array of activity objects
 */
export const getPatientActivities = async (patientId, filter = 'all') => {
  try {
    console.log('[getPatientActivities] Fetching activities for patient:', patientId, 'Filter:', filter);
    
    let query = firestore()
      .collection('patients')
      .doc(patientId)
      .collection('activities')
      .orderBy('timestamp', 'desc');

    // Apply date filters
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where('timestamp', '>=', today);
    } else if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.where('timestamp', '>=', weekAgo);
    }

    const activitiesSnapshot = await query.get();

    if (activitiesSnapshot.empty) {
      console.log('[getPatientActivities] No activities found');
      return [];
    }

    const activities = activitiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[getPatientActivities] Found activities:', activities.length);
    return activities;
  } catch (error) {
    console.error('[getPatientActivities] Error:', error);
    return [];
  }
};

/**
 * Fetch reminders for a patient that are pending
 * @param {string} patientId - The patient's ID
 * @returns {Promise<Array>} Array of pending reminder objects
 */
export const getPatientPendingReminders = async (patientId) => {
  try {
    console.log('[getPatientPendingReminders] Fetching pending reminders for patient:', patientId);
    
    const remindersSnapshot = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('reminders')
      .where('completed', '==', false)
      .orderBy('scheduledTime', 'asc')
      .get();

    if (remindersSnapshot.empty) {
      console.log('[getPatientPendingReminders] No pending reminders found');
      return [];
    }

    const reminders = remindersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[getPatientPendingReminders] Found reminders:', reminders.length);
    return reminders;
  } catch (error) {
    console.error('[getPatientPendingReminders] Error:', error);
    return [];
  }
};

/**
 * Fetch patient's last known location
 * @param {string} patientId - The patient's ID
 * @returns {Promise<Object|null>} Location object or null
 */
export const getPatientLastLocation = async (patientId) => {
  try {
    console.log('[getPatientLastLocation] Fetching last location for patient:', patientId);
    
    const locationSnapshot = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('locations')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (locationSnapshot.empty) {
      console.log('[getPatientLastLocation] No location found');
      return null;
    }

    const location = {
      id: locationSnapshot.docs[0].id,
      ...locationSnapshot.docs[0].data(),
    };

    console.log('[getPatientLastLocation] Found location:', location);
    return location;
  } catch (error) {
    console.error('[getPatientLastLocation] Error:', error);
    return null;
  }
};

/**
 * Fetch location history for a patient
 * @param {string} patientId - The patient's ID
 * @param {number} limit - Maximum number of locations to return
 * @returns {Promise<Array>} Array of location objects
 */
export const getPatientLocationHistory = async (patientId, limit = 10) => {
  try {
    console.log('[getPatientLocationHistory] Fetching location history for patient:', patientId);
    
    const locationsSnapshot = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('locations')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    if (locationsSnapshot.empty) {
      console.log('[getPatientLocationHistory] No locations found');
      return [];
    }

    const locations = locationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[getPatientLocationHistory] Found locations:', locations.length);
    return locations;
  } catch (error) {
    console.error('[getPatientLocationHistory] Error:', error);
    return [];
  }
};

/**
 * Fetch alerts for patients assigned to a caregiver
 * @param {string} caregiverId - The caregiver's ID
 * @returns {Promise<Array>} Array of alert objects
 */
export const getCaregiverAlerts = async (caregiverId) => {
  try {
    console.log('[getCaregiverAlerts] Fetching alerts for caregiver:', caregiverId);
    
    // Get all patients first
    const patients = await getCaregiverPatients(caregiverId);
    
    if (patients.length === 0) {
      console.log('[getCaregiverAlerts] No patients found');
      return [];
    }

    const allAlerts = [];

    // Fetch alerts for each patient
    for (const patient of patients) {
      try {
        const alertsSnapshot = await firestore()
          .collection('patients')
          .doc(patient.id)
          .collection('alerts')
          .where('acknowledged', '==', false)
          .orderBy('timestamp', 'desc')
          .get();

        if (!alertsSnapshot.empty) {
          const alerts = alertsSnapshot.docs.map((doc) => ({
            id: doc.id,
            patientId: patient.id,
            patientName: patient.name,
            ...doc.data(),
          }));
          allAlerts.push(...alerts);
        }
      } catch (error) {
        console.error('[getCaregiverAlerts] Error fetching alerts for patient:', patient.id, error);
      }
    }

    // Sort by timestamp
    allAlerts.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

    console.log('[getCaregiverAlerts] Found alerts:', allAlerts.length);
    return allAlerts;
  } catch (error) {
    console.error('[getCaregiverAlerts] Error:', error);
    return [];
  }
};

/**
 * Mark a reminder as completed
 * @param {string} patientId - The patient's ID
 * @param {string} reminderId - The reminder's ID
 * @returns {Promise<boolean>} Success status
 */
export const completeReminder = async (patientId, reminderId) => {
  try {
    console.log('[completeReminder] Marking reminder as completed:', reminderId);
    
    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('reminders')
      .doc(reminderId)
      .update({
        completed: true,
        completedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('[completeReminder] Reminder marked as completed');
    return true;
  } catch (error) {
    console.error('[completeReminder] Error:', error);
    return false;
  }
};

/**
 * Acknowledge an alert
 * @param {string} patientId - The patient's ID
 * @param {string} alertId - The alert's ID
 * @returns {Promise<boolean>} Success status
 */
export const acknowledgeAlert = async (patientId, alertId) => {
  try {
    console.log('[acknowledgeAlert] Acknowledging alert:', alertId);
    
    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('alerts')
      .doc(alertId)
      .update({
        acknowledged: true,
        acknowledgedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('[acknowledgeAlert] Alert acknowledged');
    return true;
  } catch (error) {
    console.error('[acknowledgeAlert] Error:', error);
    return false;
  }
};

export default {
  getCaregiverPatients,
  getPatientActivities,
  getPatientPendingReminders,
  getPatientLastLocation,
  getPatientLocationHistory,
  getCaregiverAlerts,
  completeReminder,
  acknowledgeAlert,
};
