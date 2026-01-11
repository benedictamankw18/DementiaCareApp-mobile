/**
 * Main App Component
 * Dementia Care Mobile Application
 * 
 * Handles:
 * - Firebase initialization
 * - Authentication state management
 * - Root navigation (Auth vs App Stack)
 * - Role-based navigation (Patient vs Caregiver)
 */

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, LogBox, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Suppress React Native Firebase deprecation warnings in development
// These will be fixed in v22 migration
if (__DEV__) {
  const ignoreWarns = [
    'This method is deprecated',
    'Please use `getApp()` instead',
    'Method called was `onAuthStateChanged`',
    'warnIfNotModularCall',
    'deprecated',
  ];
  
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString?.() || '';
    if (!ignoreWarns.some(warn => message.includes(warn))) {
      originalWarn(...args);
    }
  };
  
  LogBox.ignoreLogs([
    'This method is deprecated',
    'method is deprecated',
  ]);
}

// Firebase imports
import auth from '@react-native-firebase/auth';
import { onAuthStateChange, getUserRole } from './src/services/authService';

// i18n imports
import { initializeI18n } from './src/services/i18nService';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import PatientHomeScreen from './src/screens/patient/HomeScreen';
import PatientRemindersScreen from './src/screens/patient/RemindersScreen';
import PatientActivitiesScreen from './src/screens/patient/ActivitiesScreen';
import PatientSettingsScreen from './src/screens/patient/SettingsScreen';
import PatientGamesScreen from './src/screens/patient/GamesScreen';
import MemoryMatchGame from './src/screens/patient/MemoryMatchGame';
import WordPuzzleGame from './src/screens/patient/WordPuzzleGame';
import PictureRecognitionGame from './src/screens/patient/PictureRecognitionGame';
import NumberSequenceGame from './src/screens/patient/NumberSequenceGame';
import ColorMatchGame from './src/screens/patient/ColorMatchGame';
import StoryBuilderGame from './src/screens/patient/StoryBuilderGame';
import ManageCaregiversScreen from './src/screens/patient/ManageCaregiversScreen';
import EmergencyContactScreen from './src/screens/patient/EmergencyContactScreen';
import SOSSettingsScreen from './src/screens/patient/SOSSettingsScreen';

// Caregiver Screens
import DashboardScreen from './src/screens/caregiver/DashboardScreen';
import ActivityScreen from './src/screens/caregiver/ActivityScreen';
import LocationScreen from './src/screens/caregiver/LocationScreen';
import SettingsScreen from './src/screens/caregiver/SettingsScreen';
import EditProfileScreen from './src/screens/caregiver/EditProfileScreen';
import ThemeScreen from './src/screens/caregiver/ThemeScreen';
import LanguageScreen from './src/screens/caregiver/LanguageScreen';
import NotificationTimeScreen from './src/screens/caregiver/NotificationTimeScreen';
import TermsOfServiceScreen from './src/screens/caregiver/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/caregiver/PrivacyPolicyScreen';
import ManagePatientsScreen from './src/screens/caregiver/ManagePatientsScreen';

// Styles
import { colors } from './src/styles/theme';
import { SettingsProvider } from './src/state/SettingsContext';
import { ThemeProvider, useTheme } from './src/state/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Auth Stack Component
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

/**
 * Patient App Stack - With Dynamic Theme Colors
 */
const PatientStack = ({ userId }) => {
  const { colors: themeColors } = useTheme();
  
  // Start location tracking when patient app loads
  React.useEffect(() => {
    console.log('[PatientStack] Initializing location tracking for patient:', userId);
    const startTracking = async () => {
      try {
        const { startLocationTracking } = await import('./src/services/locationTrackingService');
        await startLocationTracking(userId, 30, false); // Update every 30 seconds, normal accuracy
      } catch (error) {
        console.error('[PatientStack] Failed to start location tracking:', error);
      }
    };

    startTracking();

    return () => {
      // Stop tracking when patient logs out
      console.log('[PatientStack] Stopping location tracking');
      const stopTracking = async () => {
        try {
          const { stopLocationTracking } = await import('./src/services/locationTrackingService');
          stopLocationTracking();
        } catch (error) {
          console.error('[PatientStack] Failed to stop location tracking:', error);
        }
      };
      stopTracking();
    };
  }, [userId]);
  
  return (
    <SettingsProvider>
      <Stack.Navigator>
        <Stack.Screen 
          name="PatientTabs" 
          options={{ headerShown: false }}
        >
          {(props) => <PatientTabNavigator {...props} userId={userId} />}
        </Stack.Screen>
        <Stack.Screen 
          name="Games" 
          component={PatientGamesScreen}
          options={{
            title: 'Games',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="MemoryMatchGame" 
          component={MemoryMatchGame}
          options={{
            title: 'Memory Match',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="WordPuzzleGame" 
          component={WordPuzzleGame}
          options={{
            title: 'Word Search',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="PictureRecognitionGame" 
          component={PictureRecognitionGame}
          options={{
            title: 'Picture Recognition',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="NumberSequenceGame" 
          component={NumberSequenceGame}
          options={{
            title: 'Number Sequence',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="ColorMatchGame" 
          component={ColorMatchGame}
          options={{
            title: 'Color Match',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="StoryBuilderGame" 
          component={StoryBuilderGame}
          options={{
            title: 'Story Builder',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="EmergencyContact" 
          component={EmergencyContactScreen}
          options={{
            title: 'Emergency Contacts',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen 
          name="SOSSettings" 
          component={SOSSettingsScreen}
          options={{
            title: 'SOS Settings',
            headerStyle: { backgroundColor: themeColors.primary },
            headerTintColor: themeColors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </SettingsProvider>
  );
};

/**
 * Patient Tab Navigator - With Dynamic Theme Colors
 */
const PatientTabNavigator = ({ userId }) => {
  const { colors: themeColors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'PatientHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reminders') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'history' : 'history';
          } else if (route.name === 'Caregivers') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.gray,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarStyle: { backgroundColor: themeColors.surface, borderTopColor: themeColors.lightGray },
      })}
    >
      <Tab.Screen
        name="PatientHome"
        component={PatientHomeScreen}
        initialParams={{ patientId: userId }}
        options={{
          title: 'Home',
          headerStyle: { backgroundColor: themeColors.primary },
          headerTintColor: themeColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={PatientRemindersScreen}
        initialParams={{ patientId: userId }}
        options={{
          title: 'Reminders',
          headerStyle: { backgroundColor: themeColors.primary },
          headerTintColor: themeColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Activities"
        component={PatientActivitiesScreen}
        options={{
          title: 'Activities',
          headerStyle: { backgroundColor: themeColors.primary },
          headerTintColor: themeColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Caregivers"
        component={ManageCaregiversScreen}
        options={{
          title: 'Caregivers',
          headerStyle: { backgroundColor: themeColors.primary },
          headerTintColor: themeColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={PatientSettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: themeColors.primary },
          headerTintColor: themeColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Caregiver Home Stack - With Dynamic Theme Colors
 */
const CaregiverHomeStack = ({ userId }) => {
  const { colors: themeColors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: themeColors.primary },
        headerTintColor: themeColors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        initialParams={{ caregiverId: userId }}
        options={{
          title: 'Care Dashboard',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Caregiver App Stack - With Dynamic Theme Colors
 */
const CaregiverStack = ({ userId }) => {
  const { colors: themeColors } = useTheme();
  
  return (
    <Stack.Navigator>
      <Stack.Group
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="CaregiverTabs"
          options={{ headerShown: false }}
        >
          {(props) => (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
                  if (route.name === 'DashboardTab') {
                    iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                  } else if (route.name === 'PatientsTab') {
                    iconName = focused ? 'account-heart' : 'account-heart-outline';
                  } else if (route.name === 'SettingsTab') {
                    iconName = focused ? 'cog' : 'cog-outline';
                  }
                  return (
                    <Icon
                      name={iconName}
                      size={size}
                      color={color}
                    />
                  );
                },
                tabBarActiveTintColor: themeColors.primary,
                tabBarInactiveTintColor: themeColors.gray,
                tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
                tabBarStyle: { backgroundColor: themeColors.surface, borderTopColor: themeColors.lightGray },
              })}
            >
              <Tab.Screen
                name="DashboardTab"
                component={CaregiverHomeStack}
                initialParams={{ userId }}
                options={{
                  title: 'Dashboard',
                  headerShown: false,
                }}
              />
              <Tab.Screen
                name="PatientsTab"
                component={ManagePatientsScreen}
                options={{
                  title: 'Patients',
                  headerStyle: { backgroundColor: themeColors.primary },
                  headerTintColor: themeColors.white,
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                initialParams={{ caregiverId: userId }}
                options={{
                  title: 'Settings',
                  headerStyle: { backgroundColor: themeColors.primary },
                  headerTintColor: themeColors.white,
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Group>

      {/* Modal screens accessible from any tab */}
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerStyle: { backgroundColor: themeColors.primary },
          headerTintColor: themeColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="PatientActivity"
          component={ActivityScreen}
          options={({ route }) => ({
            title: route.params?.patientName ? `${route.params.patientName}'s Activity` : 'Patient Activity',
          })}
        />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={({ route }) => ({
            title: route.params?.patientName ? `${route.params.patientName}'s Location` : 'Patient Location',
          })}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="Theme"
          component={ThemeScreen}
          options={{
            title: 'Theme Settings',
          }}
        />
        <Stack.Screen
          name="Language"
          component={LanguageScreen}
          options={{
            title: 'Language Settings',
          }}
        />
        <Stack.Screen
          name="NotificationTime"
          component={NotificationTimeScreen}
          options={{
            title: 'Notification Schedule',
          }}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{
            title: 'Terms of Service',
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            title: 'Privacy Policy',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

/**
 * Root Navigation Component
 * Determines which stack to show based on authentication and user role
 */
const RootNavigator = () => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            isLoading: false,
            isSignout: false,
            userToken: action.token,
            userId: action.userId,
            userRole: action.userRole,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isLoading: false,
            isSignout: false,
            userToken: action.token,
            userId: action.userId,
            userRole: action.userRole,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isLoading: false,
            isSignout: true,
            userToken: null,
            userId: null,
            userRole: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userId: null,
      userRole: null,
    }
  );

  useEffect(() => {
    // Check authentication state on app start
    console.log('[RootNavigator] Checking auth state...');
    
    let isSubscribed = true;
    let timeoutId;
    let unsubscribe;

    const checkAuth = async () => {
      try {
        console.log('[RootNavigator] Setting up auth listener...');
        unsubscribe = onAuthStateChange(async (authState) => {
          if (!isSubscribed) {
            console.log('[RootNavigator] Component unmounted, ignoring auth change');
            return;
          }
          
          console.log('[RootNavigator] Auth state changed:', authState);
          
          if (authState.isLoggedIn) {
            console.log('[RootNavigator] User logged in, fetching role for:', authState.userId);
            // Clear timeout since we have a user
            if (timeoutId) clearTimeout(timeoutId);
            
            // Get user role from Firestore with retry
            const role = await getUserRole(authState.userId);
            console.log('[RootNavigator] User role:', role);
            
            if (role) {
              console.log('[RootNavigator] Dispatching SIGN_IN with role:', role);
              dispatch({
                type: 'SIGN_IN',
                token: authState.userId,
                userId: authState.userId,
                userRole: role,
              });
            } else {
              console.warn('[RootNavigator] Failed to get user role after retries - logging out');
              Alert.alert(
                'Error',
                'Unable to retrieve user profile. Please check your connection and try again.',
                [{ text: 'OK', onPress: () => auth().signOut() }]
              );
              dispatch({ type: 'SIGN_OUT' });
            }
          } else {
            console.log('[RootNavigator] User not logged in');
            dispatch({ type: 'SIGN_OUT' });
          }
        });

        console.log('[RootNavigator] Auth listener set up successfully');
      } catch (error) {
        console.error('[RootNavigator] Auth check error:', error);
        // Fallback: assume not logged in if Firebase fails
        if (isSubscribed) {
          dispatch({ type: 'SIGN_OUT' });
        }
      }
    };

    // Add timeout to prevent infinite loading (5 seconds - increased for retry logic)
    timeoutId = setTimeout(() => {
      if (isSubscribed && state.isLoading) {
        console.warn('[RootNavigator] Auth check timeout - assuming not logged in');
        dispatch({ type: 'SIGN_OUT' });
      }
    }, 5000);

    checkAuth();

    return () => {
      console.log('[RootNavigator] Cleaning up auth listener');
      isSubscribed = false;
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={{ color: colors.white, marginTop: 16, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.userToken == null || !state.userRole ? (
        <>
          {console.log('[RootNavigator] Rendering AuthStack')}
          <AuthStack />
        </>
      ) : state.userRole === 'patient' ? (
        <>
          {console.log('[RootNavigator] Rendering PatientStack')}
          <PatientStack userId={state.userId} />
        </>
      ) : (
        <>
          {console.log('[RootNavigator] Rendering CaregiverStack')}
          <CaregiverStack userId={state.userId} />
        </>
      )}
    </NavigationContainer>
  );
};

/**
 * Main App Component
 */
export default function App() {
  // Initialize i18n on app startup
  useEffect(() => {
    initializeI18n();
  }, []);

  return (
    <PaperProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </PaperProvider>
  );
}
