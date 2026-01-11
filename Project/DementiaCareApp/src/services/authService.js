/**
 * Authentication Service
 * Dementia Care Mobile Application
 * 
 * Handles user login, signup, logout, and role management
 * 
 * Uses React Native Firebase (Native SDK)
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * User Sign Up
 * Creates a new user account and adds them to Firestore with their role
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @param {string} role - User role: 'patient' or 'caregiver'
 * @returns {Promise} - Result of signup operation
 */
export const signUp = async (email, password, fullName, role) => {
  try {
    // Create Firebase Auth user
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Update profile with full name
    await user.updateProfile({
      displayName: fullName
    });

    // Create user document in Firestore
    await firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        email: user.email,
        fullName: fullName,
        role: role, // 'patient' or 'caregiver'
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastSignInAt: firestore.FieldValue.serverTimestamp(),
        isActive: true,
        notificationsEnabled: true,
        fontSize: 18,
        highContrastEnabled: false,
        locationSharingEnabled: false,
      });

    console.log('User signed up successfully:', user.uid);
    return { success: true, user: user.uid };
  } catch (error) {
    console.error('Sign up error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * User Login
 * Signs in an existing user with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Result of login operation
 */
export const logIn = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Update last sign in time
    await firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        lastSignInAt: firestore.FieldValue.serverTimestamp()
      });

    console.log('User logged in successfully:', user.uid);
    return { success: true, user: user.uid };
  } catch (error) {
    console.error('Login error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * User Logout
 * Signs out the current authenticated user
 * 
 * @returns {Promise} - Result of logout operation
 */
export const logOut = async () => {
  try {
    await auth().signOut();
    console.log('User logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get User Role
 * Fetches the role of the current user from Firestore with retry logic
 * 
 * @param {string} userId - The user ID
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<string>} - User role ('patient' or 'caregiver')
 */
export const getUserRole = async (userId, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists) {
        const role = userDoc.data()?.role;
        console.log('User role retrieved:', role);
        return role || null;
      } else {
        console.warn('User document not found for userId:', userId);
        // Wait a bit and retry - document might still be creating
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return null;
      }
    } catch (error) {
      console.error(`Error getting user role (attempt ${attempt + 1}/${retries}):`, error.message);
      if (attempt < retries - 1) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      } else {
        // All retries failed
        return null;
      }
    }
  }
  return null;
};

/**
 * Get User Profile
 * Fetches complete user profile from Firestore
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      console.error('User document not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    return null;
  }
};

/**
 * Auth State Listener
 * Sets up a listener for authentication state changes
 * Uses the non-deprecated onAuthStateChanged API
 * 
 * @param {function} callback - Function to call when auth state changes
 * @returns {function} - Unsubscribe function to remove listener
 */
export const onAuthStateChange = (callback) => {
  const unsubscribe = auth().onAuthStateChanged((user) => {
    if (user) {
      callback({ isLoggedIn: true, userId: user.uid });
    } else {
      callback({ isLoggedIn: false, userId: null });
    }
  });
  return unsubscribe;
};

export default {
  signUp,
  logIn,
  logOut,
  getUserRole,
  getUserProfile,
  onAuthStateChange,
};
