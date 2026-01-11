# Firebase Setup Guide

## How to Get Your Firebase Configuration Credentials

### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com
2. Sign in with your Google account
3. Click on your Dementia Care project

### Step 2: Get Your Configuration

1. Click the **gear icon** (⚙️) in the top-left corner
2. Select **Project Settings**
3. Scroll down to **Your Apps** section
4. Find your Android app

### Step 3: Copy Configuration

1. You'll see your configuration values:
   ```
   apiKey: "AIzaXX..."
   authDomain: "your-project.firebaseapp.com"
   projectId: "your-project-id"
   storageBucket: "your-project.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:android:abc123def456"
   ```

### Step 4: Update firebase.config.js

1. Open `D:\eric\Project\DementiaCareApp\firebase.config.js`
2. Replace the placeholder values:

**BEFORE:**

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

**AFTER:**

```javascript
const firebaseConfig = {
  apiKey: 'AIzaXXXXXXXXXXXXXXXXXXXXXXXX', // Copy your actual API key
  authDomain: 'dementia-care-app.firebaseapp.com', // Your domain
  projectId: 'dementia-care-app-12345', // Your project ID
  storageBucket: 'dementia-care-app-12345.appspot.com', // Your storage bucket
  messagingSenderId: '123456789012', // Your sender ID
  appId: '1:123456789012:android:abcdef123456', // Your app ID
};
```

### Step 5: Verify Setup

After updating the config file:

```powershell
# Navigate to project
cd D:\eric\Project\DementiaCareApp

# Start the Metro bundler
npm start

# In another terminal, run on Android emulator
npm run android
```

If the app launches without Firebase errors, setup is complete! ✅

---

## Troubleshooting

### Error: "Invalid Firebase configuration"

- Check that all field names match exactly (apiKey, authDomain, projectId, etc.)
- Ensure no typos in the values
- Copy directly from Firebase Console, don't type manually

### Error: "Authentication is not initialized"

- Make sure you've replaced ALL placeholder values
- Restart the Metro bundler after updating firebase.config.js
- Clear app cache: `npm run android -- --resetCache`

### Error: "Cannot read property 'db' of undefined"

- Verify firebase.config.js is in the root directory
- Check that exports are correct: `export const auth`, `export const db`, `export const messaging`
- Verify other files import correctly: `import { auth, db } from '../firebase.config.js'`

---

## Firebase Services Already Configured

### ✅ Authentication

- Email/Password sign-in enabled
- Already configured in Android project

### ✅ Firestore Database

- Standard edition (free tier)
- Collections set up in rules
- Ready for data operations

### ✅ Cloud Messaging

- FCM enabled for push notifications
- Credentials stored in google-services.json

---

## Next: Test the App

Once you've updated firebase.config.js:

```powershell
# Clear any cached data
cd D:\eric\Project\DementiaCareApp
npm start -- --reset-cache

# In another terminal
npm run android
```

You should see:

1. App loads with Dementia Care branding
2. Login screen displays (large text, high contrast)
3. Can navigate to signup
4. Can create account (saves to Firebase)
5. Can log back in (authenticates against Firebase)

**Success = The app is ready for feature development! 🎉**
