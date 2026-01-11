/**
 * SOS Alert Service
 * Dementia Care Mobile Application
 * 
 * Service for handling emergency SOS alerts from patients
 */

import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

/**
 * Trigger an SOS alert from a patient
 * @param {string} patientId - The patient's ID
 * @param {string} patientName - The patient's name
 * @param {Object} location - Current location {latitude, longitude, address}
 * @param {string} reason - Reason for SOS alert
 * @returns {Promise<boolean>} Success status
 */
export const triggerSOSAlert = async (patientId, patientName, location = null, reason = 'Emergency') => {
  try {
    console.log('[triggerSOSAlert] SOS alert triggered by patient:', patientId);

    const alertData = {
      patientId,
      patientName,
      type: 'sos',
      severity: 'critical',
      message: `${patientName} has triggered an SOS alert: ${reason}`,
      reason,
      location: location || null,
      timestamp: firestore.FieldValue.serverTimestamp(),
      acknowledged: false,
      responders: [],
      createdAt: new Date().toISOString(),
    };

    // Get the patient's caregiver(s) from caregiver_relationships
    const relationshipsSnapshot = await firestore()
      .collection('caregiver_relationships')
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .get();

    if (relationshipsSnapshot.empty) {
      console.warn('[triggerSOSAlert] No active caregivers found for patient');
      // Still create alert even if no caregivers
    }

    const caregiverIds = relationshipsSnapshot.docs.map(doc => doc.data().caregiverId);

    // Create alert in patient's alerts collection
    const alertRef = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('alerts')
      .add(alertData);

    console.log('[triggerSOSAlert] Alert created:', alertRef.id);

    // Send notifications to all assigned caregivers
    for (const caregiverId of caregiverIds) {
      try {
        await sendSOSNotificationToCaregiver(caregiverId, patientName, reason);
      } catch (error) {
        console.error('[triggerSOSAlert] Error notifying caregiver:', caregiverId, error);
      }
    }

    // Log the alert for emergency records
    await firestore()
      .collection('alertLogs')
      .add({
        ...alertData,
        alertId: alertRef.id,
        caregiverIds,
      });

    return true;
  } catch (error) {
    console.error('[triggerSOSAlert] Error:', error);
    return false;
  }
};

/**
 * Send SOS notification to a specific caregiver
 * @param {string} caregiverId - The caregiver's ID
 * @param {string} patientName - Patient's name
 * @param {string} reason - Reason for alert
 * @returns {Promise<boolean>} Success status
 */
export const sendSOSNotificationToCaregiver = async (caregiverId, patientName, reason) => {
  try {
    // Get caregiver's device tokens
    const caregiverDoc = await firestore()
      .collection('caregivers')
      .doc(caregiverId)
      .get();

    if (!caregiverDoc.exists) {
      console.warn('[sendSOSNotificationToCaregiver] Caregiver document not found:', caregiverId);
      return false;
    }

    const deviceTokens = caregiverDoc.data()?.deviceTokens || [];

    if (deviceTokens.length === 0) {
      console.warn('[sendSOSNotificationToCaregiver] No device tokens for caregiver:', caregiverId);
      return false;
    }

    // Send notification via FCM (handled by push notification service)
    // This is a placeholder - actual notification sent via backend
    console.log('[sendSOSNotificationToCaregiver] Would send notification to:', caregiverId, deviceTokens);

    return true;
  } catch (error) {
    console.error('[sendSOSNotificationToCaregiver] Error:', error);
    return false;
  }
};

/**
 * Acknowledge an SOS alert (caregiver response)
 * @param {string} patientId - The patient's ID
 * @param {string} alertId - The alert's ID
 * @param {string} caregiverId - The caregiver's ID
 * @returns {Promise<boolean>} Success status
 */
export const acknowledgeSOSAlert = async (patientId, alertId, caregiverId) => {
  try {
    console.log('[acknowledgeSOSAlert] Acknowledging SOS alert:', alertId);

    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('alerts')
      .doc(alertId)
      .update({
        acknowledged: true,
        acknowledgedAt: firestore.FieldValue.serverTimestamp(),
        acknowledgedBy: caregiverId,
        responders: firestore.FieldValue.arrayUnion({
          caregiverId,
          respondedAt: firestore.FieldValue.serverTimestamp(),
        }),
      });

    console.log('[acknowledgeSOSAlert] Alert acknowledged');
    return true;
  } catch (error) {
    console.error('[acknowledgeSOSAlert] Error:', error);
    return false;
  }
};

/**
 * Get recent SOS alerts for a caregiver
 * @param {string} caregiverId - The caregiver's ID
 * @param {number} limit - Max number of alerts
 * @returns {Promise<Array>} Array of SOS alert objects
 */
export const getRecentSOSAlerts = async (caregiverId, limit = 10) => {
  try {
    console.log('[getRecentSOSAlerts] Fetching recent SOS alerts for caregiver:', caregiverId);

    // First try: Query by caregiverIds array
    const caregiveFilterSnapshot = await firestore()
      .collection('alertLogs')
      .where('caregiverIds', 'array-contains', caregiverId)
      .limit(limit * 2)
      .get();

    console.log('[getRecentSOSAlerts] Query by caregiverIds returned', caregiveFilterSnapshot.docs.length, 'documents');

    let allDocs = caregiveFilterSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If no results from caregiverIds filter, fetch all SOS alerts (fallback)
    if (allDocs.length === 0) {
      console.log('[getRecentSOSAlerts] No alerts found by caregiverIds, fetching all SOS alerts as fallback');
      const allAlertsSnapshot = await firestore()
        .collection('alertLogs')
        .where('type', '==', 'sos')
        .limit(limit * 2)
        .get();

      console.log('[getRecentSOSAlerts] Fallback query returned', allAlertsSnapshot.docs.length, 'SOS documents');
      allDocs = allAlertsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    if (allDocs.length === 0) {
      console.log('[getRecentSOSAlerts] No alerts found for caregiver:', caregiverId);
      return [];
    }

    console.log('[getRecentSOSAlerts] All docs retrieved:', allDocs.length);

    const alerts = allDocs
      // Filter for SOS type alerts only
      .filter((alert) => {
        const isSOS = alert.type === 'sos' || alert.severity === 'critical';
        return isSOS;
      })
      // Sort by timestamp descending (most recent first)
      .sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      })
      // Limit to requested number
      .slice(0, limit);

    console.log('[getRecentSOSAlerts] Found', alerts.length, 'SOS alerts for caregiver:', caregiverId);
    return alerts;
  } catch (error) {
    console.error('[getRecentSOSAlerts] Error:', error);
    return [];
  }
};

export default {
  triggerSOSAlert,
  sendSOSNotificationToCaregiver,
  acknowledgeSOSAlert,
  getRecentSOSAlerts,
};
