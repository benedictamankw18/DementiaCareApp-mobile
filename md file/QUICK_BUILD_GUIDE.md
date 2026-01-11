# Quick Start Guide - Building for Real Device

## 🚀 TL;DR - Get App on Phone in 5 Minutes

### Prerequisites

1. Android phone with USB debugging enabled
2. USB cable
3. Build already completed (currently in progress)

### Enable USB Debugging (First Time Only)

1. **Settings** → **About Phone** → tap **Build Number** 7 times
2. **Settings** → **Developer Options** → enable **USB Debugging**
3. Connect phone via USB, tap "Allow" on prompt

### Install the APK

Once the build finishes:

**Option 1: ADB (Easiest)**

```bash
adb install d:\eric\Project\DementiaCareApp\android\app\build\outputs\apk\debug\app-debug.apk
```

**Option 2: Copy to Phone**

1. Copy `app-debug.apk` to phone storage
2. Open file manager on phone
3. Tap the APK file
4. Tap "Install"

### Launch App

- Tap **Dementia Care App** icon on home screen
- Login with test account

---

## 📋 What to Test First

### On First Launch:

1. ✅ Does app load without crashing?
2. ✅ Can you login?
3. ✅ Do all screens display?

### Test One Game:

1. Go to **Games** tab
2. Tap **Play** on any game
3. Play through a complete game
4. Verify score saves

### Check Real-Time Updates:

1. Play 2-3 games
2. Go back to **Games** screen
3. Check stats updated in real-time

---

## 🐛 If Build Fails

**Check:**

```bash
# Check Java version
java -version

# Check Android SDK
echo %ANDROID_HOME%

# View build logs
cd d:\eric\Project\DementiaCareApp\android
type build.log
```

**Common Fixes:**

- Clean and rebuild: `gradlew.bat clean assembleDebug`
- Update Gradle: `gradlew.bat wrapper --gradle-version latest`
- Clear Node modules: `rm -r node_modules && npm install`

---

## 📱 Device Requirements

**Minimum:**

- Android 5.0 (API 21)
- 50MB free storage
- 2GB RAM

**Recommended:**

- Android 10+
- 100MB free storage
- 4GB RAM

---

## ✅ Build Status

Currently building: **Debug APK**

- Progress: 46% (Configuring)
- Time: ~2-3 minutes remaining
- Check back when complete!

Look for: `d:\eric\Project\DementiaCareApp\android\app\build\outputs\apk\debug\app-debug.apk`

---

## 🔗 Related Docs

- Full Testing Guide: `/md file/TESTING_GUIDE.md`
- Game Enhancements: `/md file/GAME_ENHANCEMENTS.md`
- System Architecture: `/md file/SYSTEM_ARCHITECTURE.md`
