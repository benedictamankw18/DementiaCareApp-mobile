# Dementia Care App - Mobile Testing Guide

## 📱 Building & Installing on Real Device

### Prerequisites

- ✅ Java 17+ (OpenJDK) installed
- ✅ Android SDK installed (API Level 21+)
- ✅ Android device with USB debugging enabled
- ✅ USB cable for connecting device

### Step 1: Enable USB Debugging on Android Device

1. Go to **Settings > About Phone**
2. Find **Build Number** and tap it 7 times until developer mode is enabled
3. Go to **Settings > Developer Options**
4. Enable **USB Debugging**
5. Connect device to computer via USB
6. Accept the USB debugging prompt on the device

### Step 2: Build the APK

**Option A: Debug Build (Fastest - Recommended for Testing)**

```bash
cd d:\eric\Project\DementiaCareApp\android
gradlew.bat assembleDebug
```

**Option B: Release Build (Production)**

```bash
cd d:\eric\Project\DementiaCareApp\android
gradlew.bat assembleRelease
```

**Option C: Using npm script**

```bash
cd d:\eric\Project\DementiaCareApp
npm run build:android:debug
```

### Step 3: Locate the APK

After successful build, the APK will be at:

**Debug APK:**

```
d:\eric\Project\DementiaCareApp\android\app\build\outputs\apk\debug\app-debug.apk
```

**Release APK:**

```
d:\eric\Project\DementiaCareApp\android\app\build\outputs\apk\release\app-release.apk
```

### Step 4: Install on Device

**Option A: Using ADB (Android Debug Bridge)**

```bash
adb install path/to/app-debug.apk
```

**Option B: Direct APK Installation**

1. Copy the APK to your device via USB
2. Open a file manager on your device
3. Locate and tap the APK file
4. Tap "Install"
5. Grant necessary permissions

**Option C: Using React Native CLI**

```bash
cd d:\eric\Project\DementiaCareApp
npx react-native run-android --variant=debug
```

---

## 🧪 Testing Checklist

### Authentication Tests

- [ ] Signup with new account
- [ ] Login with existing account
- [ ] Logout and verify redirect to login screen
- [ ] Password reset functionality
- [ ] Session persistence after app restart

### Patient Screen Tests

#### Home Screen

- [ ] Dashboard loads with correct patient name
- [ ] Activity summary displays correctly
- [ ] Upcoming reminders show on schedule
- [ ] Total activity time displays
- [ ] Navigation to other screens works

#### Games Screen

- [ ] All 6 games display with correct info
- [ ] Stats card updates in real-time
- [ ] Daily challenge shows current progress
- [ ] Games can be selected and launched
- [ ] Difficulty levels work (Easy, Medium, Hard)

#### Individual Game Tests

**Memory Match Game**

- [ ] Cards flip on tap
- [ ] Matching pairs stay flipped
- [ ] Non-matching pairs flip back
- [ ] Score increases on match (+10)
- [ ] Timer counts down
- [ ] Win screen appears on completion
- [ ] Different difficulties work (4/6/8 pairs)

**Word Search Game**

- [ ] Letter grid displays correctly
- [ ] Tap to select letters for words
- [ ] Check button validates words
- [ ] Clear button resets selection
- [ ] Score awarded based on word length
- [ ] Different grid sizes work (6x6/8x8/10x10)

**Picture Recognition Game**

- [ ] Emoji images display clearly
- [ ] Multiple choice options appear
- [ ] Correct answer gives +10 points
- [ ] Feedback shows if answer is correct/wrong
- [ ] Difficulty levels change picture count (5/6/7)

**Number Sequence Game**

- [ ] Sequences display with placeholder
- [ ] Multiple choice options show numbers
- [ ] Correct answer gives +15 points
- [ ] Hint button shows sequence type
- [ ] Different difficulty levels work

**Color Match Game**

- [ ] Color cards display as colored squares
- [ ] Cards flip to show color on tap
- [ ] Matching pairs stay flipped
- [ ] Score increases on match (+10)
- [ ] Progress bar updates
- [ ] Different color counts work (4/6/8)

**Story Builder Game**

- [ ] Story prompt displays clearly
- [ ] Text input accepts user typing
- [ ] Word count updates in real-time
- [ ] Submit button disabled until minimum words met
- [ ] Score based on word count
- [ ] Can proceed to next story after submission

#### Reminders Screen

- [ ] Reminders display in list
- [ ] Can set new reminders
- [ ] Can edit existing reminders
- [ ] Can delete reminders
- [ ] Notifications work at scheduled time
- [ ] Snooze functionality works

#### Activities Screen

- [ ] Activities display in feed
- [ ] Can log new activities
- [ ] Activity history shows correct info
- [ ] Can edit activity details
- [ ] High contrast mode readable

#### Settings Screen

- [ ] Theme selection works (Light/Dark)
- [ ] Language selection works (EN/ES/FR/DE)
- [ ] Font size adjustment works
- [ ] High contrast mode toggle works
- [ ] Settings persist after app restart
- [ ] Accessibility settings apply globally

### Caregiver Screen Tests

#### Dashboard

- [ ] Patient list displays
- [ ] Can select patient to view details
- [ ] Activity feed shows patient activities
- [ ] Stats show games played/streak/achievements
- [ ] Real-time updates work

#### Activity Screen

- [ ] Patient activities display
- [ ] Can add new activities
- [ ] Can edit activities
- [ ] Activity history shows timeline
- [ ] Filters work (by type, date)

#### Settings

- [ ] Theme, language, notifications configurable
- [ ] Changes apply immediately
- [ ] Settings persist

### Real-Time Features

- [ ] Game stats update immediately after session
- [ ] Daily challenge progress updates live
- [ ] Streak calculation is correct
- [ ] Session history logs to Firestore

### Accessibility Tests

- [ ] High contrast mode text is readable
- [ ] Font sizes scale correctly
- [ ] All buttons have adequate touch targets
- [ ] Icons are clear and recognizable
- [ ] Color is not only indicator (text labels present)

### Performance Tests

- [ ] App starts in < 3 seconds
- [ ] Games load quickly
- [ ] No lag during gameplay
- [ ] Memory usage stays reasonable
- [ ] Battery drain is acceptable
- [ ] Network requests complete successfully

### Offline Tests (if implemented)

- [ ] Can view previously loaded data offline
- [ ] Games can be played offline (local save)
- [ ] Data syncs when connection restored
- [ ] No crashes when losing connection

---

## 🐛 Debugging on Device

### Enable Debug Logs

The app has console logging throughout. You can view logs using:

```bash
adb logcat | grep "GamesScreen\|gamesService\|StoryBuilder\|MemoryMatch"
```

### Check Firebase Connection

```bash
adb logcat | grep "Firebase\|firestore"
```

### Common Issues & Solutions

**Issue: App crashes on startup**

- Check Firebase initialization in App.js
- Verify Firebase config in firebase.config.js
- Check console logs for missing dependencies

**Issue: Games don't save scores**

- Verify Firestore is initialized
- Check user authentication (auth().currentUser)
- Check Firestore security rules allow writes

**Issue: Stats don't update**

- Verify Firestore listener is set up
- Check network connectivity
- Check browser/device console for errors

**Issue: App too slow**

- Check for unnecessary re-renders
- Profile using React DevTools
- Reduce number of real-time listeners if many active

**Issue: Language doesn't change**

- Clear app cache and restart
- Check i18nService initialization
- Verify AsyncStorage permissions

---

## 📊 Test Results Template

```
App Version: _______________
Android Version: _______________
Device Model: _______________
Test Date: _______________

PASSED TESTS: _____ / _____
FAILED TESTS: _____

Critical Issues (Blockers):
- [ ] Issue 1
- [ ] Issue 2

Medium Issues:
- [ ] Issue 1
- [ ] Issue 2

Low Issues (Polish):
- [ ] Issue 1
- [ ] Issue 2

Notes:
_________________________________
_________________________________
```

---

## 🚀 Releasing to Play Store (Future)

When ready for real users:

1. **Generate Release Keystore**

   ```bash
   keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Build**

   - Update gradle.properties with keystore info
   - Update versionCode and versionName in build.gradle

3. **Build Release APK/AAB**

   ```bash
   cd android
   gradlew.bat bundleRelease
   ```

4. **Upload to Play Console**
   - Create Google Play Developer account
   - Upload signed APK/AAB
   - Fill in app details, screenshots, privacy policy

---

## 📞 Testing Support

For issues or questions:

- Check logcat output for detailed error messages
- Verify all dependencies are installed
- Ensure Firebase credentials are correct
- Test on physical device, not just emulator
