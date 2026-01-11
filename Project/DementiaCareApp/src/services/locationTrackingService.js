/**
 * Location Tracking Service
 * Dementia Care Mobile Application
 * 
 * Service for continuous background location tracking and Firestore updates
 * Tracks patient location and stores it for caregiver visibility
 */

import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

// Store subscription ID to manage tracking
let locationSubscriptionId = null;
let updateInterval = null;

/**
 * Convert coordinates to address using reverse geocoding
 * Falls back to coordinates if geocoding fails
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} - Address string or coordinates
 */
const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // For now, return coordinates as fallback
    // In production, integrate with Google Maps Geocoding API
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.warn('[getAddressFromCoordinates] Error:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Update patient's current location in Firestore
 * @param {string} patientId - Patient ID
 * @param {object} position - Geolocation position object
 * @returns {Promise<void>}
 */
const updatePatientLocation = async (patientId, position) => {
  try {
    if (!patientId) {
      console.warn('[updatePatientLocation] No patient ID provided');
      return;
    }

    const { latitude, longitude, accuracy, altitude, speed } = position.coords;

    // Get address from coordinates
    const address = await getAddressFromCoordinates(latitude, longitude);

    // Update patients collection with current location - use set with merge to create if doesn't exist
    await firestore()
      .collection('patients')
      .doc(patientId)
      .set({
        currentLocation: {
          latitude,
          longitude,
          address,
          accuracy: Math.round(accuracy),
          altitude: altitude || null,
          speed: speed || null,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
        lastLocationUpdate: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

    // Also save to location history
    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('locations')
      .add({
        latitude,
        longitude,
        address,
        accuracy: Math.round(accuracy),
        altitude: altitude || null,
        speed: speed || null,
        timestamp: firestore.FieldValue.serverTimestamp(),
        source: 'background_tracking',
      });

    console.log('[updatePatientLocation] Location updated:', { latitude, longitude, address, accuracy });
  } catch (error) {
    console.error('[updatePatientLocation] Error:', error);
  }
};

/**
 * Start background location tracking
 * @param {string} patientId - Patient ID
 * @param {number} updateIntervalSeconds - How often to update location (default 30 seconds)
 * @param {boolean} enableHighAccuracy - Use high accuracy GPS (drains battery more)
 * @returns {Promise<void>}
 */
export const startLocationTracking = async (
  patientId,
  updateIntervalSeconds = 30,
  enableHighAccuracy = false
) => {
  try {
    console.log('[startLocationTracking] Starting location tracking for patient:', patientId);

    // Stop any existing tracking
    stopLocationTracking();

    // Get initial location
    const position = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });

    // Update with initial location
    await updatePatientLocation(patientId, position);

    // Set up periodic tracking
    updateInterval = setInterval(async () => {
      try {
        Geolocation.getCurrentPosition(
          (position) => {
            updatePatientLocation(patientId, position);
          },
          (error) => {
            console.warn('[startLocationTracking] Geolocation error:', error.message);
          },
          {
            enableHighAccuracy,
            timeout: 15000,
            maximumAge: 5000, // Allow 5-second old location
          }
        );
      } catch (error) {
        console.error('[startLocationTracking] Error in update interval:', error);
      }
    }, updateIntervalSeconds * 1000);

    // Also set up watch position for real-time updates when app is active
    locationSubscriptionId = Geolocation.watchPosition(
      (position) => {
        updatePatientLocation(patientId, position);
      },
      (error) => {
        console.warn('[startLocationTracking] Watch position error:', error);
      },
      {
        enableHighAccuracy,
        timeout: 15000,
        maximumAge: 0,
        useSignificantChanges: true, // Only update on significant location changes
      }
    );

    console.log('[startLocationTracking] Location tracking started successfully');
  } catch (error) {
    console.error('[startLocationTracking] Failed to start tracking:', error);
    Alert.alert(
      'Location Permission',
      'Unable to start location tracking. Please enable location permissions in app settings.'
    );
  }
};

/**
 * Stop background location tracking
 * @returns {void}
 */
export const stopLocationTracking = () => {
  try {
    if (locationSubscriptionId !== null) {
      Geolocation.clearWatch(locationSubscriptionId);
      locationSubscriptionId = null;
      console.log('[stopLocationTracking] Watch position cleared');
    }

    if (updateInterval !== null) {
      clearInterval(updateInterval);
      updateInterval = null;
      console.log('[stopLocationTracking] Update interval cleared');
    }

    console.log('[stopLocationTracking] Location tracking stopped');
  } catch (error) {
    console.error('[stopLocationTracking] Error stopping tracking:', error);
  }
};

/**
 * Check if location tracking is active
 * @returns {boolean}
 */
export const isLocationTrackingActive = () => {
  return locationSubscriptionId !== null || updateInterval !== null;
};

/**
 * Update location tracking interval
 * @param {number} newIntervalSeconds - New interval in seconds
 * @returns {void}
 */
export const updateTrackingInterval = (newIntervalSeconds) => {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
  }
  // Restart with new interval when next location is needed
  console.log('[updateTrackingInterval] Tracking interval updated to:', newIntervalSeconds, 'seconds');
};

/**
 * Get current patient location
 * @param {string} patientId - Patient ID
 * @returns {Promise<object|null>} - Current location object or null
 */
export const getCurrentPatientLocation = async (patientId) => {
  try {
    const doc = await firestore()
      .collection('patients')
      .doc(patientId)
      .get();

    if (doc.exists && doc.data().currentLocation) {
      return doc.data().currentLocation;
    }
    return null;
  } catch (error) {
    console.error('[getCurrentPatientLocation] Error:', error);
    return null;
  }
};

export default {
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  updateTrackingInterval,
  getCurrentPatientLocation,
};
