# Dementia Care App - Installation & Setup

## 📦 App Details

**App Name:** Dementia Care App
**Version:** 0.0.1
**Package Name:** com.dementiacareapp
**Minimum Android:** 5.0 (API 21)
**Target Android:** 14 (API 36)

---

## 🔧 Installation Methods

### Method 1: Via ADB (Android Debug Bridge)

**Best for:** Developers and technical testers

```bash
# Prerequisite: ADB must be installed
adb devices  # Verify device is connected

# Install debug APK
adb install d:\eric\Project\DementiaCareApp\android\app\build\outputs\apk\debug\app-debug.apk

# Or reinstall if already exists
adb install -r d:\eric\Project\DementiaCareApp\android\app\build\outputs\apk\debug\app-debug.apk

# Uninstall
adb uninstall com.dementiacareapp

# Clear app data
adb shell pm clear com.dementiacareapp
```

### Method 2: File Manager Installation

**Best for:** Non-technical users

1. Transfer APK to phone via USB cable
2. Open phone's **File Manager** app
3. Navigate to where APK was saved
4. Tap the APK file
5. Tap **Install** button
6. Grant permissions when prompted
7. Tap **Open** to launch

### Method 3: Email/Drive Installation

**Best for:** Remote distribution

1. Email the APK file to recipient
2. Download on Android device
3. Open file manager
4. Find downloaded APK in Downloads folder
5. Tap to install

---

## 🔐 Permissions Granted

The app requests these permissions:

```xml
<!-- Location -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Storage (Android 10 and below) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Grant these permissions when first prompted by the app.

---

## 🎯 First Launch Checklist

After installing and opening the app:

1. **Create Account or Login**

   - New users: Tap "Sign Up", enter email, password, personal details
   - Existing users: Enter email and password

2. **Set Role**

   - Select whether you are a **Patient** or **Caregiver**

3. **Complete Preferences** (First Time Only)

   - Language preference (English, Spanish, French, German)
   - Theme preference (Light/Dark)
   - Font size
   - Accessibility options

4. **Allow Permissions**
   - Location (for emergency features)
   - Notifications (for reminders)
   - Storage (if needed)

---

## 🧪 Test Accounts

Use these credentials for testing:

**Patient Account:**

- Email: `patient@test.com`
- Password: `Test12345!`

**Caregiver Account:**

- Email: `caregiver@test.com`
- Password: `Test12345!`

Or create your own account to test signup flow.

---

## 📊 Key Features to Explore

### For Patients:

1. **Games (6 games available)**

   - Memory Match
   - Word Search
   - Picture Recognition
   - Number Sequence
   - Color Match
   - Story Builder

2. **Home Dashboard**

   - Activity summary
   - Upcoming reminders
   - Quick stats

3. **Reminders**

   - Medication reminders
   - Activity reminders
   - Custom notifications

4. **Activities**

   - Log daily activities
   - Track mood and health
   - View activity history

5. **Settings**
   - Theme preferences
   - Language selection
   - Accessibility options
   - Profile management

### For Caregivers:

1. **Patient Dashboard**

   - View patient activities
   - Monitor game progress
   - Check daily statistics

2. **Activity Feed**

   - See real-time patient activities
   - Log observations
   - View historical data

3. **Notifications**

   - Receive alerts about patient activity
   - Set reminders for patient care tasks

4. **Settings**
   - Same as patient plus:
     - Manage notification preferences
     - Configure alert thresholds

---

## 🔌 Connectivity Requirements

**Internet Connection:** Required for:

- Authentication
- Syncing data to Firestore
- Game session logging
- Real-time stats updates
- Push notifications

**No Connection:** App will:

- Still run (if cached)
- Queue data for sync
- Show cached content
- Warn user of sync issues

---

## 📱 Troubleshooting Installation

### "App not installed" error

- **Solution 1:** Clear Google Play Store cache
  ```bash
  adb shell pm clear com.android.vending
  ```
- **Solution 2:** Enable "Unknown Sources" in Security settings
- **Solution 3:** Rebuild and reinstall APK

### "Insufficient storage space" error

- Free up space on device (need ~50MB)
- Uninstall unused apps
- Clear cache

### "App keeps crashing on startup"

- Clear app data:
  ```bash
  adb shell pm clear com.dementiacareapp
  ```
- Check logcat for errors:
  ```bash
  adb logcat | grep "DementiaCareApp\|Firebase"
  ```
- Reinstall fresh APK

### "Can't login to Firebase"

- Check internet connection
- Verify email/password
- Check Firebase is enabled in console
- Check user email is verified (check email inbox)

---

## 📲 Device Recommendations

### Minimum (Will work, slower)

- Android 5.0 or higher
- 2GB RAM
- 50MB storage space
- Dual-core processor

### Recommended (Best experience)

- Android 10 or higher
- 4GB RAM
- 100MB storage space
- Octa-core processor

### Tested Devices

- Pixel 6/7/8 series
- Samsung Galaxy A/S series
- OnePlus devices
- Generic Android devices (API 21+)

---

## 🔄 Updating the App

### To Update:

1. Build new APK with updated code
2. Use `adb install -r` to reinstall and preserve app data
3. Or uninstall and reinstall fresh

### Preserving User Data:

- App data stored in Firestore (survives reinstalls)
- Local preferences in AsyncStorage (survives reinstalls)
- Only lost if you manually clear app cache/data

---

## 🗑️ Uninstalling

### Via ADB:

```bash
adb uninstall com.dementiacareapp
```

### Via Phone:

1. **Settings** → **Apps** → **Dementia Care App**
2. Tap **Uninstall**
3. Confirm deletion

### Data After Uninstall:

- All local app data deleted
- Cloud data (Firestore) remains and syncs after reinstall
- Firebase profile remains

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:**

   ```bash
   adb logcat -s "GamesScreen:*" "gamesService:*" "StoryBuilder:*"
   ```

2. **Common error messages and solutions are in:** `/md file/TESTING_GUIDE.md`

3. **For Firebase issues:**

   - Verify Firebase credentials in `firebase.config.js`
   - Check Firestore security rules
   - Verify user authentication is working

4. **For gameplay issues:**
   - Each game logs to console with `[GameName]` prefix
   - Check device specifications meet minimum requirements

---

## ✅ Successful Installation Indicators

You'll know installation was successful when:

- ✅ App icon appears on home screen
- ✅ App opens and shows login screen
- ✅ Can create account or login
- ✅ All screens load without crashing
- ✅ Can navigate between tabs
- ✅ Games launch and respond to taps
- ✅ Data syncs to cloud (check Firestore console)
