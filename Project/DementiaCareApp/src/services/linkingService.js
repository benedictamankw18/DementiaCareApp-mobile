/**
 * Linking Service
 * Dementia Care Mobile Application
 * 
 * Handles caregiver-patient relationship management and consent records
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Send a connection request from one user to another
 * @param {string} fromUserId - User sending the request
 * @param {string} toUserId - User receiving the request
 * @param {string} fromUserRole - Role of sender ('patient' | 'caregiver')
 * @param {string} relationshipType - Type of relationship ('family' | 'professional' | 'friend')
 * @param {string} relationshipDetail - Optional detail (e.g., 'daughter', 'nurse')
 * @returns {Promise<string>} - ID of created relationship
 */
export const sendConnectionRequest = async (fromUserId, toUserId, fromUserRole, relationshipType = 'family', relationshipDetail = '') => {
  try {
    console.log('[sendConnectionRequest] Sending request from:', fromUserId, 'to:', toUserId);
    
    // Determine patient and caregiver IDs based on sender role
    const patientId = fromUserRole === 'patient' ? fromUserId : toUserId;
    const caregiverId = fromUserRole === 'caregiver' ? fromUserId : toUserId;
    
    // Check if relationship already exists
    const existingRelationship = await firestore()
      .collection('caregiver_relationships')
      .where('patientId', '==', patientId)
      .where('caregiverId', '==', caregiverId)
      .get();
    
    if (!existingRelationship.empty) {
      const existing = existingRelationship.docs[0].data();
      if (existing.status === 'active') {
        throw new Error('ALREADY_CONNECTED');
      } else if (existing.status === 'pending') {
        throw new Error('REQUEST_PENDING');
      } else if (existing.status === 'revoked') {
        // Allow re-sending if previously revoked
        console.log('[sendConnectionRequest] Revoked relationship exists, creating new one');
      }
    }
    
    // Create new relationship
    const relationshipData = {
      patientId,
      caregiverId,
      linkedBy: fromUserId,
      relationshipType,
      relationshipDetail,
      primaryCaregiver: false,
      status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
      activatedAt: null,
      revokedAt: null,
      revokeReason: null,
      permissions: [
        'view_location',
        'manage_reminders',
        'view_activities',
        'receive_emergencies',
      ],
    };
    
    const docRef = await firestore()
      .collection('caregiver_relationships')
      .add(relationshipData);
    
    console.log('[sendConnectionRequest] Request created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[sendConnectionRequest] Error:', error);
    throw error;
  }
};

/**
 * Accept a pending connection request
 * @param {string} relationshipId - ID of the relationship
 * @param {string} userId - User accepting the request
 * @returns {Promise<boolean>} Success status
 */
export const acceptConnectionRequest = async (relationshipId, userId) => {
  try {
    console.log('[acceptConnectionRequest] Accepting relationship:', relationshipId);
    
    const relationshipRef = firestore()
      .collection('caregiver_relationships')
      .doc(relationshipId);
    
    const relationshipDoc = await relationshipRef.get();
    
    if (!relationshipDoc.exists) {
      throw new Error('Relationship not found');
    }
    
    const relationship = relationshipDoc.data();
    
    if (relationship.status !== 'pending') {
      throw new Error('Relationship is not pending');
    }
    
    // Update relationship to active
    await relationshipRef.update({
      status: 'active',
      activatedAt: firestore.FieldValue.serverTimestamp(),
    });
    
    // Create default consent records
    await createDefaultConsents(relationship.patientId, relationship.caregiverId);
    
    console.log('[acceptConnectionRequest] Request accepted');
    return true;
  } catch (error) {
    console.error('[acceptConnectionRequest] Error:', error);
    throw error;
  }
};

/**
 * Reject a pending connection request
 * @param {string} relationshipId - ID of the relationship
 * @param {string} userId - User rejecting the request
 * @returns {Promise<boolean>} Success status
 */
export const rejectConnectionRequest = async (relationshipId, userId) => {
  try {
    console.log('[rejectConnectionRequest] Rejecting relationship:', relationshipId);
    
    await firestore()
      .collection('caregiver_relationships')
      .doc(relationshipId)
      .update({
        status: 'revoked',
        revokedAt: firestore.FieldValue.serverTimestamp(),
        revokeReason: 'Rejected by recipient',
      });
    
    console.log('[rejectConnectionRequest] Request rejected');
    return true;
  } catch (error) {
    console.error('[rejectConnectionRequest] Error:', error);
    throw error;
  }
};

/**
 * Revoke an active connection
 * @param {string} relationshipId - ID of the relationship
 * @param {string} userId - User revoking the connection
 * @param {string} reason - Reason for revocation
 * @returns {Promise<boolean>} Success status
 */
export const revokeConnection = async (relationshipId, userId, reason = 'Revoked by user') => {
  try {
    console.log('[revokeConnection] Revoking relationship:', relationshipId);
    
    await firestore()
      .collection('caregiver_relationships')
      .doc(relationshipId)
      .update({
        status: 'revoked',
        revokedAt: firestore.FieldValue.serverTimestamp(),
        revokeReason: reason,
      });
    
    // Revoke all consent records
    const relationshipDoc = await firestore()
      .collection('caregiver_relationships')
      .doc(relationshipId)
      .get();
    
    const { patientId, caregiverId } = relationshipDoc.data();
    await revokeAllConsents(patientId, caregiverId);
    
    console.log('[revokeConnection] Connection revoked');
    return true;
  } catch (error) {
    console.error('[revokeConnection] Error:', error);
    throw error;
  }
};

/**
 * Get pending connection requests for a user
 * @param {string} userId - User ID
 * @param {string} role - User role ('patient' | 'caregiver')
 * @returns {Promise<Array>} Array of pending requests with user details
 */
export const getPendingRequests = async (userId, role) => {
  try {
    console.log('[getPendingRequests] Fetching for:', userId, role);
    
    const field = role === 'patient' ? 'patientId' : 'caregiverId';
    
    const requestsSnapshot = await firestore()
      .collection('caregiver_relationships')
      .where(field, '==', userId)
      .where('status', '==', 'pending')
      .get();
    
    const requests = [];
    
    for (const doc of requestsSnapshot.docs) {
      const data = doc.data();
      
      // Fetch the other user's details
      const otherUserId = role === 'patient' ? data.caregiverId : data.patientId;
      const userDoc = await firestore()
        .collection('users')
        .doc(otherUserId)
        .get();
      
      const userData = userDoc.exists ? userDoc.data() : {};
      
      requests.push({
        id: doc.id,
        ...data,
        otherUser: {
          id: otherUserId,
          name: userData.fullName || userData.displayName || 'Unknown User',
          email: userData.email || '',
          profilePhoto: userData.profilePhoto || null,
        },
      });
    }
    
    console.log('[getPendingRequests] Found:', requests.length);
    return requests;
  } catch (error) {
    console.error('[getPendingRequests] Error:', error);
    return [];
  }
};

/**
 * Get active connections for a user
 * @param {string} userId - User ID
 * @param {string} role - User role ('patient' | 'caregiver')
 * @returns {Promise<Array>} Array of active connections with user details
 */
export const getActiveConnections = async (userId, role) => {
  try {
    console.log('[getActiveConnections] Fetching for:', userId, role);
    
    const field = role === 'patient' ? 'patientId' : 'caregiverId';
    
    const connectionsSnapshot = await firestore()
      .collection('caregiver_relationships')
      .where(field, '==', userId)
      .where('status', '==', 'active')
      .get();
    
    const connections = [];
    
    for (const doc of connectionsSnapshot.docs) {
      const data = doc.data();
      
      // Fetch the other user's details
      const otherUserId = role === 'patient' ? data.caregiverId : data.patientId;
      const userDoc = await firestore()
        .collection('users')
        .doc(otherUserId)
        .get();
      
      const userData = userDoc.exists ? userDoc.data() : {};
      
      connections.push({
        id: doc.id,
        ...data,
        otherUser: {
          id: otherUserId,
          name: userData.fullName || userData.displayName || 'Unknown User',
          email: userData.email || '',
          profilePhoto: userData.profilePhoto || null,
          phoneNumber: userData.phoneNumber || '',
        },
      });
    }
    
    console.log('[getActiveConnections] Found:', connections.length);
    return connections;
  } catch (error) {
    console.error('[getActiveConnections] Error:', error);
    return [];
  }
};

/**
 * Find a user by email
 * @param {string} email - Email to search for
 * @returns {Promise<object|null>} User object or null
 */
export const findUserByEmail = async (email) => {
  try {
    console.log('[findUserByEmail] Searching for:', email);
    
    const userSnapshot = await firestore()
      .collection('users')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return null;
    }
    
    const userDoc = userSnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('[findUserByEmail] Error:', error);
    return null;
  }
};

/**
 * Grant consent for a caregiver to access specific data
 * @param {string} patientId - Patient ID
 * @param {string} caregiverId - Caregiver ID
 * @param {string} consentType - Type of consent
 * @returns {Promise<string>} Consent record ID
 */
export const grantConsent = async (patientId, caregiverId, consentType) => {
  try {
    console.log('[grantConsent] Granting consent:', consentType);
    
    // Check if consent already exists
    const existingConsent = await firestore()
      .collection('consent_records')
      .where('patientId', '==', patientId)
      .where('caregiverId', '==', caregiverId)
      .where('consentType', '==', consentType)
      .get();
    
    if (!existingConsent.empty) {
      // Update existing consent
      const consentId = existingConsent.docs[0].id;
      await firestore()
        .collection('consent_records')
        .doc(consentId)
        .update({
          isGranted: true,
          grantedAt: firestore.FieldValue.serverTimestamp(),
        });
      return consentId;
    }
    
    // Create new consent
    const consentData = {
      patientId,
      caregiverId,
      consentType,
      isGranted: true,
      grantedAt: firestore.FieldValue.serverTimestamp(),
      expiresAt: null,
      notes: '',
      history: [
        {
          status: 'granted',
          notes: 'Initial consent granted',
        },
      ],
    };
    
    const docRef = await firestore()
      .collection('consent_records')
      .add(consentData);
    
    console.log('[grantConsent] Consent granted:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[grantConsent] Error:', error);
    throw error;
  }
};

/**
 * Revoke a specific consent
 * @param {string} patientId - Patient ID
 * @param {string} caregiverId - Caregiver ID
 * @param {string} consentType - Type of consent to revoke
 * @returns {Promise<boolean>} Success status
 */
export const revokeConsent = async (patientId, caregiverId, consentType) => {
  try {
    console.log('[revokeConsent] Revoking consent:', consentType);
    
    const consentSnapshot = await firestore()
      .collection('consent_records')
      .where('patientId', '==', patientId)
      .where('caregiverId', '==', caregiverId)
      .where('consentType', '==', consentType)
      .get();
    
    if (consentSnapshot.empty) {
      console.warn('[revokeConsent] Consent not found');
      return false;
    }
    
    const consentId = consentSnapshot.docs[0].id;
    await firestore()
      .collection('consent_records')
      .doc(consentId)
      .update({
        isGranted: false,
        revokedAt: firestore.FieldValue.serverTimestamp(),
      });
    
    console.log('[revokeConsent] Consent revoked');
    return true;
  } catch (error) {
    console.error('[revokeConsent] Error:', error);
    throw error;
  }
};

/**
 * Get consent records for a caregiver-patient pair
 * @param {string} patientId - Patient ID
 * @param {string} caregiverId - Caregiver ID
 * @returns {Promise<Array>} Array of consent records
 */
export const getConsents = async (patientId, caregiverId) => {
  try {
    const consentsSnapshot = await firestore()
      .collection('consent_records')
      .where('patientId', '==', patientId)
      .where('caregiverId', '==', caregiverId)
      .get();
    
    return consentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[getConsents] Error:', error);
    return [];
  }
};

/**
 * Create default consent records when connection is accepted
 * @param {string} patientId - Patient ID
 * @param {string} caregiverId - Caregiver ID
 * @returns {Promise<void>}
 */
const createDefaultConsents = async (patientId, caregiverId) => {
  const defaultConsents = [
    'location_tracking',
    'activity_monitoring',
    'reminder_management',
  ];
  
  for (const consentType of defaultConsents) {
    await grantConsent(patientId, caregiverId, consentType);
  }
};

/**
 * Revoke all consents for a caregiver-patient pair
 * @param {string} patientId - Patient ID
 * @param {string} caregiverId - Caregiver ID
 * @returns {Promise<void>}
 */
const revokeAllConsents = async (patientId, caregiverId) => {
  const consentsSnapshot = await firestore()
    .collection('consent_records')
    .where('patientId', '==', patientId)
    .where('caregiverId', '==', caregiverId)
    .get();
  
  for (const doc of consentsSnapshot.docs) {
    await doc.ref.update({
      isGranted: false,
      revokedAt: firestore.FieldValue.serverTimestamp(),
    });
  }
};

export default {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  revokeConnection,
  getPendingRequests,
  getActiveConnections,
  findUserByEmail,
  grantConsent,
  revokeConsent,
  getConsents,
};
