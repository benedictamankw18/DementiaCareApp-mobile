# COMPLETE PROJECT SETUP GUIDE

## Dementia Care Mobile Application

**Project Title:** Design and Development of a Dementia Care Mobile Application for Patient and Caregiver Support

**Technology Stack:** React Native, Firebase, Android Emulator

**Date:** January 7, 2026

---

## TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Firebase Configuration](#3-firebase-configuration)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Installation & Dependencies](#5-installation--dependencies)
6. [Environment Variables](#6-environment-variables)
7. [Running the Application](#7-running-the-application)
8. [Development Workflow](#8-development-workflow)
9. [Testing Setup](#9-testing-setup)
10. [Build & Deployment](#10-build--deployment)
11. [Troubleshooting](#11-troubleshooting)
12. [Project Configuration Files](#12-project-configuration-files)

---

## 1. PREREQUISITES

### 1.1 System Requirements

**Operating System:**

- Windows 10/11 (recommended for this guide)
- macOS 10.15+ or Linux (also supported)

**Hardware:**

- Minimum 8 GB RAM (16 GB recommended)
- 15 GB disk space for Android SDK and emulator
- Modern processor (Intel Core i5 or equivalent)

### 1.2 Required Software (Install in This Order)

| Software                       | Version        | Purpose                  | Download                             |
| ------------------------------ | -------------- | ------------------------ | ------------------------------------ |
| **Node.js**                    | 18.x or higher | JavaScript runtime & npm | https://nodejs.org                   |
| **npm**                        | 9.x or higher  | Package manager          | Installed with Node.js               |
| **Java Development Kit (JDK)** | 11 or 17       | Android compilation      | https://adoptium.net                 |
| **Android Studio**             | Latest         | Android development IDE  | https://developer.android.com/studio |
| **Git**                        | Latest         | Version control          | https://git-scm.com                  |
| **Visual Studio Code**         | Latest         | Code editor              | https://code.visualstudio.com        |

### 1.3 Installation Steps

#### **Step 1: Install Node.js and npm**

```powershell
# Download and run Node.js installer from https://nodejs.org
# Select LTS version (Long Term Support)

# Verify installation
node --version     # Should be v18.x or higher
npm --version      # Should be 9.x or higher
```

#### **Step 2: Install Java Development Kit (JDK)**

```powershell
# Option A: Using Chocolatey (Windows)
choco install openjdk17

# Option B: Download from https://adoptium.net
# Extract and add to JAVA_HOME environment variable

# Verify installation
java -version      # Should show JDK 11 or 17
```

#### **Step 3: Install Android Studio**

```
1. Download from https://developer.android.com/studio
2. Run installer
3. Follow setup wizard
4. Select "Standard Installation"
5. Install Android SDK, Android Emulator, and Android SDK Tools
```

#### **Step 4: Configure Android Environment Variables (Windows)**

```
1. Right-click "This PC" → Properties → Advanced system settings
2. Click "Environment Variables"
3. Create new system variables:
   - ANDROID_HOME = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   - JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.x
4. Add to PATH:
   - %ANDROID_HOME%\platform-tools
   - %ANDROID_HOME%\tools
5. Click OK and restart terminal
```

#### **Step 5: Install Git**

```
1. Download from https://git-scm.com
2. Run installer with default options
3. Verify: git --version
```

#### **Step 6: Install Visual Studio Code**

```
1. Download from https://code.visualstudio.com
2. Run installer
3. Open VS Code and install extensions:
   - React Native Tools
   - ES7+ React/Redux/React-Native snippets
   - Firebase
   - Thunder Client (API testing)
```

### 1.4 Verification Checklist

```powershell
# Run these commands to verify all installations
node --version
npm --version
java -version
git --version
echo %ANDROID_HOME%
echo %JAVA_HOME%
```

All commands should return version numbers (no "command not found" errors).

---

## 2. PROJECT SETUP

### 2.1 Create Project Folder

```powershell
# Navigate to desired location
cd D:\eric\Projects

# Create project folder
mkdir DementiaCareApp
cd DementiaCareApp
```

### 2.2 Fix PowerShell Execution Policy (Windows)

```powershell
# Enable script execution for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Verify the change
Get-ExecutionPolicy -Scope CurrentUser
# Should output: RemoteSigned
```

### 2.3 Initialize React Native Project

```powershell
# Using React Native Community CLI (recommended)
# Navigate to parent directory first
cd D:\eric\Project

# Initialize with auto-confirm
npx -y @react-native-community/cli@latest init DementiaCareApp

# Navigate into project
cd DementiaCareApp
```

**Output:**

```
✓ React Native project created
✓ Dependencies installed
✓ Project ready for development
```

### 2.4 Verify Initial Setup

```powershell
# Test if React Native CLI works
cd DementiaCareApp
npx react-native --version

# Should output: React Native version x.x.x
```

---

## 3. FIREBASE CONFIGURATION

### 3.1 Create Firebase Project

#### **Step 1: Go to Firebase Console**

```
1. Open https://console.firebase.google.com
2. Sign in with Google account
3. Click "Create a project"
```

#### **Step 2: Project Details**

```
Project Name: DementiaCareApp
Analytics: Enable (recommended for production)
Region: United States (or your preferred region)
```

#### **Step 3: Create Android App**

```
1. Project Settings → Add app
2. Select "Android"
3. Enter Package Name: com.example.dementiacareapp
4. Download google-services.json
5. Copy to: DementiaCareApp/android/app/
```

#### **Step 4: Enable Firebase Services**

In Firebase Console, enable:

- **Authentication**
  - Go to Authentication → Sign-in method
  - Enable "Email/Password"
- **Firestore Database**
  - Go to Firestore Database → Create database
  - Region: us-central1
  - Start in **Test Mode** (for development)
- **Cloud Messaging**

  - Go to Cloud Messaging
  - Copy Server Key (needed for notifications)

- **Storage** (optional, for profile photos)
  - Go to Storage → Create bucket
  - Allow read/write for authenticated users

### 3.2 Firebase Configuration File

**File: `firebase.config.js`**

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export default app;
```

**How to Get These Values:**

```
1. Open Firebase Console
2. Project Settings (gear icon)
3. Copy config object
4. Paste into firebaseConfig above
```

---

## 4. PROJECT FOLDER STRUCTURE

### 4.1 Recommended Project Layout

```
DementiaCareApp/
│
├── android/                    # Android native code
│   ├── app/
│   │   ├── google-services.json
│   │   └── build.gradle
│   └── build.gradle
│
├── ios/                        # iOS native code (optional)
│
├── src/                        # Main source code
│   ├── screens/               # React Native screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── SignupScreen.js
│   │   ├── patient/
│   │   │   ├── HomeScreen.js
│   │   │   ├── RemindersScreen.js
│   │   │   ├── GamesScreen.js
│   │   │   ├── SOSScreen.js
│   │   │   └── SettingsScreen.js
│   │   ├── caregiver/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── PatientActivityScreen.js
│   │   │   ├── LocationScreen.js
│   │   │   ├── RemindersManagementScreen.js
│   │   │   └── SettingsScreen.js
│   │   └── shared/
│   │       ├── LoadingScreen.js
│   │       └── ErrorScreen.js
│   │
│   ├── components/             # Reusable components
│   │   ├── buttons/
│   │   │   ├── LargeButton.js
│   │   │   └── SOSButton.js
│   │   ├── cards/
│   │   │   ├── ReminderCard.js
│   │   │   └── ActivityCard.js
│   │   ├── modals/
│   │   │   ├── ReminderModal.js
│   │   │   └── ConfirmDialog.js
│   │   └── inputs/
│   │       ├── LargeTextInput.js
│   │       └── DateTimePicker.js
│   │
│   ├── navigation/             # Navigation setup
│   │   ├── PatientNavigator.js
│   │   ├── CaregiverNavigator.js
│   │   └── RootNavigator.js
│   │
│   ├── services/               # Firebase & API services
│   │   ├── authService.js
│   │   ├── firestoreService.js
│   │   ├── locationService.js
│   │   ├── notificationService.js
│   │   └── consentService.js
│   │
│   ├── state/                  # State management (Redux or Context)
│   │   ├── actions/
│   │   │   ├── authActions.js
│   │   │   ├── reminderActions.js
│   │   │   └── locationActions.js
│   │   ├── reducers/
│   │   │   ├── authReducer.js
│   │   │   ├── reminderReducer.js
│   │   │   └── locationReducer.js
│   │   └── store.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── dateUtils.js
│   │   ├── validationUtils.js
│   │   ├── locationUtils.js
│   │   └── notificationUtils.js
│   │
│   ├── styles/                 # Shared styles & theme
│   │   ├── colors.js
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   └── theme.js
│   │
│   ├── constants/              # App constants
│   │   ├── appConstants.js
│   │   ├── routes.js
│   │   └── permissions.js
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useReminders.js
│   │   ├── useLocation.js
│   │   └── useNotifications.js
│   │
│   └── App.js                  # Root component
│
├── __tests__/                  # Test files
│   ├── auth/
│   │   └── authService.test.js
│   ├── screens/
│   │   └── LoginScreen.test.js
│   └── utils/
│       └── dateUtils.test.js
│
├── assets/                     # Images, fonts, etc.
│   ├── images/
│   │   ├── icons/
│   │   └── logos/
│   └── fonts/
│       └── Roboto/
│
├── firebase.config.js          # Firebase configuration
├── .env                        # Environment variables
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore file
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── babel.config.js            # Babel configuration
├── app.json                   # App configuration
└── README.md                  # Project documentation
```

### 4.2 Create Folder Structure

```powershell
# From DementiaCareApp root directory
mkdir src
mkdir src\screens
mkdir src\screens\auth
mkdir src\screens\patient
mkdir src\screens\caregiver
mkdir src\screens\shared
mkdir src\components
mkdir src\components\buttons
mkdir src\components\cards
mkdir src\components\modals
mkdir src\components\inputs
mkdir src\navigation
mkdir src\services
mkdir src\state
mkdir src\state\actions
mkdir src\state\reducers
mkdir src\utils
mkdir src\styles
mkdir src\constants
mkdir src\hooks
mkdir __tests__
mkdir assets
mkdir assets\images
mkdir assets\images\icons
mkdir assets\fonts
```

---

## 5. INSTALLATION & DEPENDENCIES

### 5.1 Install Core Dependencies

```powershell
cd DementiaCareApp

npm install
```

### 5.2 Install Firebase Packages

```powershell
npm install firebase
npm install @react-native-async-storage/async-storage
npm install @react-native-community/geolocation
npm install react-native-geolocation-service
npm install @react-native-camera/camera
npm install react-native-maps
npm install react-native-push-notification
```

### 5.3 Install UI & Navigation Libraries

```powershell
# React Native Paper (UI Library - required)
npm install react-native-paper

# Navigation
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-navigation/stack
npm install react-native-screens
npm install react-native-safe-area-context

# State Management
npm install @reduxjs/toolkit
npm install react-redux

# Date/Time Handling
npm install date-fns
npm install moment

# Form Validation
npm install formik
npm install yup

# Utilities
npm install lodash
npm install axios
```

### 5.4 Install Development Dependencies

```powershell
npm install --save-dev @testing-library/react-native
npm install --save-dev @testing-library/jest-native
npm install --save-dev jest
npm install --save-dev babel-jest
npm install --save-dev @babel/preset-react
```

### 5.5 Install Android Native Dependencies

```powershell
# Navigate to Android folder
cd android

# Download and configure Gradle
./gradlew build

cd ..
```

### 5.6 Complete package.json

**File: `package.json`**

```json
{
  "name": "DementiaCareApp",
  "version": "1.0.0",
  "description": "Design and Development of a Dementia Care Mobile Application for Patient and Caregiver Support",
  "main": "index.js",
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "build:android": "cd android && ./gradlew assembleRelease && cd ..",
    "build:apk": "cd android && ./gradlew bundleRelease && cd .."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "firebase": "^10.0.0",
    "@react-native-async-storage/async-storage": "^1.18.0",
    "@react-native-camera/camera": "^5.0.0",
    "@react-native-community/geolocation": "^3.0.0",
    "react-native-geolocation-service": "^5.3.0",
    "react-native-maps": "^1.7.0",
    "react-native-paper": "^5.11.0",
    "react-native-push-notification": "^8.1.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-screens": "^3.22.0",
    "react-native-safe-area-context": "^4.7.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.1.0",
    "date-fns": "^2.30.0",
    "moment": "^2.29.0",
    "formik": "^2.4.0",
    "yup": "^1.2.0",
    "lodash": "^4.17.0",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.4.0",
    "jest": "^29.0.0",
    "babel-jest": "^29.0.0",
    "@babel/preset-react": "^7.22.0",
    "eslint": "^8.48.0",
    "eslint-config-react-native": "^6.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## 6. ENVIRONMENT VARIABLES

### 6.1 Create .env File

**File: `.env`**

```
# Firebase Configuration
FIREBASE_API_KEY=YOUR_API_KEY_HERE
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
FIREBASE_APP_ID=YOUR_APP_ID

# App Configuration
APP_NAME=DementiaCareApp
APP_VERSION=1.0.0
API_TIMEOUT=30000

# Feature Flags
ENABLE_LOCATION_TRACKING=true
ENABLE_NOTIFICATIONS=true
ENABLE_GAMES=true
ENABLE_OFFLINE_MODE=true

# Location Settings
LOCATION_UPDATE_INTERVAL=600000
LOCATION_ACCURACY=10

# Development Settings
DEBUG_MODE=false
LOG_LEVEL=info
```

### 6.2 Create .env.example

**File: `.env.example`**

```
# Copy this file to .env and fill in your own values

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

APP_NAME=DementiaCareApp
APP_VERSION=1.0.0
API_TIMEOUT=30000

ENABLE_LOCATION_TRACKING=true
ENABLE_NOTIFICATIONS=true
ENABLE_GAMES=true
ENABLE_OFFLINE_MODE=true

LOCATION_UPDATE_INTERVAL=600000
LOCATION_ACCURACY=10

DEBUG_MODE=false
LOG_LEVEL=info
```

### 6.3 Load Environment Variables

**File: `src/config/env.js`**

```javascript
import { Platform } from "react-native";
import { name as appName } from "../../app.json";

// For development, you can use a library like react-native-dotenv
// For production, use Firebase Remote Config or similar

const ENV = {
  development: {
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    appName: appName,
    apiTimeout: 30000,
    debugMode: true,
    logLevel: "debug",
  },
  production: {
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    appName: appName,
    apiTimeout: 30000,
    debugMode: false,
    logLevel: "error",
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
```

---

## 7. RUNNING THE APPLICATION

### 7.1 Start Android Emulator

```powershell
# Option A: Launch from Android Studio
# Open Android Studio → AVD Manager → Start emulator

# Option B: Launch from command line
emulator -avd Pixel_5_API_30

# (Replace Pixel_5_API_30 with your emulator name)
```

**Expected Output:**

```
emulator: Android Emulator booting...
emulator: Console is available at port 5554
```

### 7.2 Start Metro Bundler

```powershell
# In project root (DementiaCareApp)
npm start

# Or
npx react-native start
```

**Expected Output:**

```
                 ▲
                │
          │      │
          │      │
          │      │
  ┌───────┴──────┴───────┐
  │                       │
  │  Metro Bundler       │
  │                       │
  └─────────────────────┘

Metro waiting on exp://192.168.1.100:19000
Logs for your project will appear below. Press Ctrl+C to exit.
```

### 7.3 Run App on Android Emulator

**In a new terminal (keep Metro Bundler running):**

```powershell
npm run android

# Or
npx react-native run-android
```

**Expected Output:**

```
info Launching emulator...
info Installing the app...
info Connecting to Android emulator...
info App launched successfully
```

### 7.4 Build APK (For Testing)

```powershell
# Create debug APK
npm run build:android

# Create release APK
npm run build:apk

# APK location: android/app/build/outputs/apk/
```

---

## 8. DEVELOPMENT WORKFLOW

### 8.1 Development Best Practices

#### **Hot Reloading**

- Changes automatically reflect in emulator
- Save file → App updates in 1-2 seconds
- Cmd+M (Android): Open developer menu

#### **Debugging**

```powershell
# React Native Debugger
npm install -g react-native-debugger

# Start debugger
react-native-debugger

# In app: Cmd+M → "Debug"
```

#### **Console Logging**

```javascript
// In your code
console.log("Debug message:", data);
console.warn("Warning message");
console.error("Error message");

// View in Metro Bundler terminal
```

### 8.2 Recommended Development Folder Structure

```
D:\Projects\
├── DementiaCareApp/          # Main project
├── Firebase Console (browser)
├── Android Studio (emulator)
├── VS Code (code editor)
└── Chrome DevTools (debugging)
```

### 8.3 Development Checklist

- [ ] All dependencies installed
- [ ] Firebase configured with google-services.json
- [ ] .env file created and filled
- [ ] Android Emulator running
- [ ] Metro Bundler running
- [ ] App successfully loaded on emulator
- [ ] Can navigate between screens
- [ ] Firebase connection working

---

## 9. TESTING SETUP

### 9.1 Jest Configuration

**File: `jest.config.js`**

```javascript
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/index.js",
  ],
};
```

### 9.2 Unit Test Example

**File: `__tests__/utils/dateUtils.test.js`**

```javascript
import {
  formatDateForDisplay,
  isDateInPast,
  getDaysUntilDate,
} from "../../src/utils/dateUtils";

describe("dateUtils", () => {
  describe("formatDateForDisplay", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const result = formatDateForDisplay(date);
      expect(result).toBe("Jan 15, 2024");
    });
  });

  describe("isDateInPast", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date("2020-01-01");
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date("2030-01-01");
      expect(isDateInPast(futureDate)).toBe(false);
    });
  });

  describe("getDaysUntilDate", () => {
    it("should calculate days until date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const result = getDaysUntilDate(futureDate);
      expect(result).toBe(5);
    });
  });
});
```

### 9.3 Run Tests

```powershell
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test authService.test.js

# Generate coverage report
npm test -- --coverage
```

---

## 10. BUILD & DEPLOYMENT

### 10.1 Release Build Process

#### **Step 1: Prepare Release**

```powershell
# Update version in app.json
# Update version in package.json
# Test thoroughly in debug mode
```

#### **Step 2: Generate Signed APK**

```powershell
# Create keystore (one-time)
cd android/app
keytool -genkey -v -keystore dementia-care-app.keystore -keyalg RSA -keysize 2048 -validity 10000

# When prompted:
# - Keystore password: (create secure password)
# - Key password: (same as keystore password)
# - Fill in your information
# - Confirm and save password

cd ../..
```

#### **Step 3: Configure Build**

**File: `android/app/build.gradle`**

```gradle
android {
  signingConfigs {
    release {
      storeFile file('/path/to/dementia-care-app.keystore')
      storePassword 'your_keystore_password'
      keyAlias 'dementia-care-app'
      keyPassword 'your_key_password'
    }
  }

  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
}
```

#### **Step 4: Build Release APK**

```powershell
npm run build:apk

# APK location: android/app/build/outputs/apk/release/
```

### 10.2 Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security rules tested in Firebase Console
- [ ] Firebase database backed up
- [ ] Release notes prepared
- [ ] Version number updated
- [ ] Signed APK generated
- [ ] APK tested on actual device

---

## 11. TROUBLESHOOTING

### 11.1 Common Issues & Solutions

#### **Issue: "PowerShell execution policy error"**

```powershell
# Error: "cannot be loaded because running scripts is disabled"
# Solution: Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Then retry your command
```

#### **Issue: "React Native Cli not found" or deprecated init command**

```powershell
# Solution: Use the updated community CLI
npx -y @react-native-community/cli@latest init DementiaCareApp

# OR check version
npx @react-native-community/cli --version
```

#### **Issue: "Android SDK not found"**

```powershell
# Solution: Check ANDROID_HOME
echo %ANDROID_HOME%

# If empty, set it manually
setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\Sdk"

# Restart terminal and try again
```

#### **Issue: "Metro Bundler crashes"**

```powershell
# Solution: Clear cache and restart
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

#### **Issue: "Firebase configuration error"**

```javascript
// Check firebase.config.js
// Verify all values from Firebase Console match

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  // These must match your Firebase project exactly
  apiKey: "check-in-console",
  authDomain: "check-in-console",
  projectId: "check-in-console",
  storageBucket: "check-in-console",
  messagingSenderId: "check-in-console",
  appId: "check-in-console",
};

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app); // Should not throw error
```

#### **Issue: "Module not found"**

```powershell
# Solution: Reinstall dependencies
rm -r node_modules package-lock.json
npm install
npm start -- --reset-cache
```

#### **Issue: "Permission denied" errors**

```powershell
# For Android:
# 1. Check AndroidManifest.xml has required permissions
# 2. Request runtime permissions in code
# 3. Test on real device or emulator API 23+

# For Firebase:
# 1. Check Firestore Security Rules
# 2. Verify user is authenticated
# 3. Check user role and permissions
```

#### **Issue: "Emulator won't start"**

```powershell
# Solution 1: Reset emulator
emulator -avd Pixel_5_API_30 -wipe-data

# Solution 2: Increase available RAM in AVD settings
# Open Android Studio → AVD Manager → Edit → Increase RAM

# Solution 3: Use a lower API level
# API 30 or 29 recommended for stability
```

### 11.2 Debug Commands

```powershell
# Check React Native version
npx react-native --version

# Check Android SDK status
%ANDROID_HOME%\tools\bin\sdkmanager --list_installed

# Check Firebase connection
# Add to App.js:
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Firebase Auth connected:', !!auth);

# View Metro Bundler logs
# Shows in terminal where you ran: npm start

# View Android emulator logs
adb logcat

# Clear Android emulator data
adb shell pm clear com.example.dementiacareapp
```

---

## 12. PROJECT CONFIGURATION FILES

### 12.1 babel.config.js

**File: `babel.config.js`**

```javascript
module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-private-methods", { loose: true }],
  ],
};
```

### 12.2 app.json

**File: `app.json`**

```json
{
  "name": "DementiaCareApp",
  "displayName": "Dementia Care",
  "expo": {
    "name": "Dementia Care",
    "slug": "dementia-care-app",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.example.dementiacareapp"
    }
  }
}
```

### 12.3 .gitignore

**File: `.gitignore`**

```
# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Firebase
google-services.json
firebase.config.js
.env
.env.local
.env.*.local

# Android
android/.gradle/
android/.idea/
android/local.properties
android/app/build/
android/*.jks
android/*.keystore

# iOS
ios/Pods/
ios/Podfile.lock

# Build
build/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Logs
*.log

# Misc
.cache/
tmp/
temp/
```

### 12.4 .eslintrc.js

**File: `.eslintrc.js`**

```javascript
module.exports = {
  root: true,
  extends: "@react-native-community",
  rules: {
    "prettier/prettier": 0,
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
```

---

## 13. QUICK START CHECKLIST

### Installation Phase

- [ ] Install Node.js 18+
- [ ] Install JDK 11 or 17
- [ ] Install Android Studio
- [ ] Set ANDROID_HOME and JAVA_HOME
- [ ] Install Git and VS Code

### Project Setup Phase

- [ ] Create project folder
- [ ] Run `npx react-native@latest init`
- [ ] Create Firebase project
- [ ] Download google-services.json
- [ ] Place google-services.json in android/app/

### Dependencies Phase

- [ ] Run `npm install`
- [ ] Install Firebase packages
- [ ] Install UI and Navigation libraries
- [ ] Verify all dependencies installed

### Configuration Phase

- [ ] Create .env file
- [ ] Copy firebase config values
- [ ] Configure android/app/build.gradle
- [ ] Set ANDROID_HOME variable

### Testing Phase

- [ ] Start Android Emulator
- [ ] Run `npm start`
- [ ] Run `npm run android` in new terminal
- [ ] Verify app loads successfully
- [ ] Test navigation and basic functionality

### Ready for Development!

---

## CONCLUSION

This setup guide provides:

✅ **Complete Installation Instructions** - Every tool and library needed  
✅ **Firebase Configuration** - Step-by-step Firebase project setup  
✅ **Project Folder Structure** - Organized, professional structure  
✅ **Dependencies Management** - All required packages listed  
✅ **Environment Setup** - Secure configuration management  
✅ **Testing Framework** - Jest and React Native Testing Library  
✅ **Build & Deployment** - Release build process  
✅ **Troubleshooting Guide** - Solutions to common problems

You now have everything needed to set up and run the Dementia Care Mobile Application!

---

**Document Version:** 1.0  
**Date:** January 7, 2026  
**Status:** Complete & Ready for Use
