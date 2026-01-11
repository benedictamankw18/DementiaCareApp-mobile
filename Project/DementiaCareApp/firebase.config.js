/**
 * Firebase Configuration for React Native
 * 
 * React Native Firebase uses NATIVE SDKs and initializes automatically
 * from android/app/google-services.json (Android) and ios/GoogleService-Info.plist (iOS)
 * 
 * NO firebaseConfig object needed!
 * 
 * Project Info (from google-services.json):
 * - Project ID: dementiacareapp-c7975
 * - App ID: 1:636850953634:android:ac0a7618c99505725be6fb
 * - API Key: AIzaSyBxi6PYDHxS_1kyx3A0_qr-R678BwHXI7M
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Export Firebase services for use throughout the app
export { auth, firestore, messaging };

// Default export for compatibility
export default {
  auth,
  firestore,
  messaging,
};
