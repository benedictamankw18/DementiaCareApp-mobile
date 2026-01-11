/**
 * Geofencing Service
 * Dementia Care Mobile Application
 * 
 * Service for location tracking and geofence alert detection
 * Uses background location tracking and safe zone monitoring
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Add a safe zone for a patient
 * @param {string} patientId - The patient's ID
 * @param {Object} zone - Safe zone object {name, latitude, longitude, radius}
 * @returns {Promise<string>} Zone ID
 */
export const addSafeZone = async (patientId, zone) => {
  try {
    console.log('[addSafeZone] Adding safe zone for patient:', patientId);

    const safeZoneData = {
      name: zone.name,
      latitude: zone.latitude,
      longitude: zone.longitude,
      radius: zone.radius || 500, // Default 500 meters
      createdAt: firestore.FieldValue.serverTimestamp(),
      active: true,
    };

    const zoneRef = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('safeZones')
      .add(safeZoneData);

    console.log('[addSafeZone] Safe zone created:', zoneRef.id);
    return zoneRef.id;
  } catch (error) {
    console.error('[addSafeZone] Error:', error);
    throw error;
  }
};

/**
 * Get all safe zones for a patient
 * @param {string} patientId - The patient's ID
 * @returns {Promise<Array>} Array of safe zone objects
 */
export const getPatientSafeZones = async (patientId) => {
  try {
    console.log('[getPatientSafeZones] Fetching safe zones for patient:', patientId);

    const zonesSnapshot = await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('safeZones')
      .where('active', '==', true)
      .get();

    if (zonesSnapshot.empty) {
      console.log('[getPatientSafeZones] No safe zones found');
      return [];
    }

    const zones = zonesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[getPatientSafeZones] Found zones:', zones.length);
    return zones;
  } catch (error) {
    console.error('[getPatientSafeZones] Error:', error);
    return [];
  }
};

/**
 * Check if current location is within any safe zone
 * @param {string} patientId - The patient's ID
 * @param {number} currentLat - Current latitude
 * @param {number} currentLon - Current longitude
 * @returns {Promise<Object>} {isInSafeZone, zone}
 */
export const checkLocationInSafeZone = async (patientId, currentLat, currentLon) => {
  try {
    console.log('[checkLocationInSafeZone] Checking location for patient:', patientId);

    const zones = await getPatientSafeZones(patientId);

    for (const zone of zones) {
      const distance = calculateDistance(
        currentLat,
        currentLon,
        zone.latitude,
        zone.longitude
      );

      // Convert radius from meters to kilometers if needed
      const radiusInKm = zone.radius / 1000;

      if (distance <= radiusInKm) {
        console.log('[checkLocationInSafeZone] Location is in safe zone:', zone.name);
        return {
          isInSafeZone: true,
          zone,
          distance,
        };
      }
    }

    console.log('[checkLocationInSafeZone] Location is NOT in any safe zone');
    return {
      isInSafeZone: false,
      zone: null,
      distance: null,
    };
  } catch (error) {
    console.error('[checkLocationInSafeZone] Error:', error);
    return {
      isInSafeZone: false,
      zone: null,
      distance: null,
    };
  }
};

/**
 * Log location check and create alert if outside safe zones
 * @param {string} patientId - The patient's ID
 * @param {string} patientName - The patient's name
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @param {string} address - Current address (optional)
 * @returns {Promise<boolean>} Whether alert was created
 */
export const logLocationAndCheckGeofence = async (
  patientId,
  patientName,
  latitude,
  longitude,
  address = null
) => {
  try {
    console.log('[logLocationAndCheckGeofence] Logging location for patient:', patientId);

    // Save location to Firestore
    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('locations')
      .add({
        latitude,
        longitude,
        address: address || 'Unknown',
        timestamp: firestore.FieldValue.serverTimestamp(),
        accuracy: 0,
      });

    // Check if in safe zone
    const { isInSafeZone, zone } = await checkLocationInSafeZone(patientId, latitude, longitude);

    // If not in safe zone, create alert
    if (!isInSafeZone) {
      console.log('[logLocationAndCheckGeofence] Patient outside safe zones - creating alert');

      await firestore()
        .collection('patients')
        .doc(patientId)
        .collection('alerts')
        .add({
          type: 'geofence',
          severity: 'warning',
          patientId,
          patientName,
          message: `${patientName} has left their safe zone`,
          location: {
            latitude,
            longitude,
            address: address || 'Unknown',
          },
          timestamp: firestore.FieldValue.serverTimestamp(),
          acknowledged: false,
        });

      return true; // Alert created
    }

    return false; // No alert needed - in safe zone
  } catch (error) {
    console.error('[logLocationAndCheckGeofence] Error:', error);
    return false;
  }
};

/**
 * Update safe zone
 * @param {string} patientId - The patient's ID
 * @param {string} zoneId - The safe zone ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<boolean>} Success status
 */
export const updateSafeZone = async (patientId, zoneId, updates) => {
  try {
    console.log('[updateSafeZone] Updating safe zone:', zoneId);

    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('safeZones')
      .doc(zoneId)
      .update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('[updateSafeZone] Safe zone updated');
    return true;
  } catch (error) {
    console.error('[updateSafeZone] Error:', error);
    return false;
  }
};

/**
 * Delete safe zone
 * @param {string} patientId - The patient's ID
 * @param {string} zoneId - The safe zone ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteSafeZone = async (patientId, zoneId) => {
  try {
    console.log('[deleteSafeZone] Deleting safe zone:', zoneId);

    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('safeZones')
      .doc(zoneId)
      .delete();

    console.log('[deleteSafeZone] Safe zone deleted');
    return true;
  } catch (error) {
    console.error('[deleteSafeZone] Error:', error);
    return false;
  }
};

/**
 * Get geofence alerts for a caregiver
 * @param {string} caregiverId - The caregiver's ID
 * @param {number} limit - Max number of alerts
 * @returns {Promise<Array>} Array of geofence alert objects
 */
export const getGeofenceAlerts = async (caregiverId, limit = 10) => {
  try {
    console.log('[getGeofenceAlerts] Fetching geofence alerts for caregiver:', caregiverId);

    // Get caregiver's patients from caregiver_relationships
    const relationshipsSnapshot = await firestore()
      .collection('caregiver_relationships')
      .where('caregiverId', '==', caregiverId)
      .where('status', '==', 'active')
      .get();

    const alerts = [];

    for (const relationshipDoc of relationshipsSnapshot.docs) {
      const patientId = relationshipDoc.data().patientId;
      
      try {
        const patientAlerts = await firestore()
          .collection('patients')
          .doc(patientId)
          .collection('alerts')
          .where('type', '==', 'geofence')
          .where('acknowledged', '==', false)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();

        if (!patientAlerts.empty) {
          alerts.push(
            ...patientAlerts.docs.map((doc) => ({
              id: doc.id,
              patientId: patientDoc.id,
              ...doc.data(),
            }))
          );
        }
      } catch (error) {
        console.error('[getGeofenceAlerts] Error fetching alerts for patient:', patientDoc.id, error);
      }
    }

    // Sort by timestamp
    alerts.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

    console.log('[getGeofenceAlerts] Found alerts:', alerts.length);
    return alerts.slice(0, limit);
  } catch (error) {
    console.error('[getGeofenceAlerts] Error:', error);
    return [];
  }
};

export default {
  calculateDistance,
  addSafeZone,
  getPatientSafeZones,
  checkLocationInSafeZone,
  logLocationAndCheckGeofence,
  updateSafeZone,
  deleteSafeZone,
  getGeofenceAlerts,
};
