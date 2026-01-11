# 🚀 Android Development Environment Setup Guide

## Current Issues

- ❌ Java/JDK not installed
- ❌ JAVA_HOME environment variable not set
- ❌ Android SDK tools (adb) not in PATH
- ❌ No Android emulator created

---

## ✅ Solution: Install Required Tools

### Step 1: Install Java Development Kit (JDK)

**Option A: Using Chocolatey (Recommended if installed)**

```powershell
choco install openjdk17
```

**Option B: Manual Download**

1. Download JDK 17 from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. Download `jdk-17.0.X_windows-x64_bin.msi`
3. Install to default location (usually `C:\Program Files\Java\jdk-17.0.X`)

**Option C: Using Windows Package Manager**

```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

### Step 2: Set JAVA_HOME Environment Variable

After Java is installed:

1. **Open Environment Variables:**

   - Press `Win + X` → Click "System"
   - Click "Advanced system settings"
   - Click "Environment Variables" button

2. **Create New System Variable:**

   - Click "New..." (under System variables)
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Java\jdk-17.0.X` (adjust version number)
   - Click OK

3. **Restart PowerShell** to apply changes

4. **Verify it worked:**
   ```powershell
   $env:JAVA_HOME
   java -version
   ```

### Step 3: Install Android Studio

Download from: https://developer.android.com/studio

This includes:

- Android SDK
- Android Emulator
- Build tools

### Step 4: Set ANDROID_HOME and Add to PATH

After Android Studio is installed:

1. **Open Environment Variables again**

2. **Create new System variable:**

   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - Click OK

3. **Edit PATH variable:**

   - Select `Path` and click Edit
   - Add these entries:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\emulator`

4. **Restart PowerShell**

5. **Verify adb works:**
   ```powershell
   adb --version
   ```

### Step 5: Create Android Emulator

1. **Open Android Studio**
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create device"
4. Select a device (e.g., Pixel 4a)
5. Select API level 30 or higher
6. Click "Finish"

### Step 6: Start Emulator

**Option A: From Android Studio**

- Open Virtual Device Manager
- Click play button on emulator

**Option B: From Command Line**

```powershell
emulator -avd Pixel_4a_API_30
```

---

## 🧪 Verify Setup

Run these commands to verify everything is set up correctly:

```powershell
# Check Java
java -version

# Check JDK compiler
javac -version

# Check JAVA_HOME
$env:JAVA_HOME

# Check Android SDK
$env:ANDROID_HOME

# Check adb
adb --version

# Check emulators
emulator -list-avds
```

All should return version info without errors.

---

## 🚀 Then Run Your App

Once everything is set up:

**Terminal 1: Start Metro Bundler**

```powershell
cd D:\eric\Project\DementiaCareApp
npm start
```

**Terminal 2: Start Emulator (if not running)**

```powershell
emulator -avd Pixel_4a_API_30
```

**Terminal 3: Build and Run App**

```powershell
npm run android
```

---

## 🆘 Troubleshooting

### Still getting "adb not recognized"

- Make sure you restarted PowerShell AFTER setting environment variables
- Check that `%ANDROID_HOME%\platform-tools` exists
- Run: `Get-ChildItem "$env:ANDROID_HOME\platform-tools"`

### "JAVA_HOME is not set"

- Verify you set it: `$env:JAVA_HOME` (should show path)
- Make sure you restarted PowerShell
- Try setting it temporarily in PowerShell: `$env:JAVA_HOME="C:\Program Files\Java\jdk-17.0.X"`

### Emulator won't start

- Make sure Android Studio is installed correctly
- Check Virtual Device Manager in Android Studio
- Create a device if none exist
- Ensure your PC has 4GB+ RAM available

### Build still fails

Run this diagnostic:

```powershell
npx react-native doctor
```

This will check all your setup and tell you what's missing.

---

## 📋 Quick Setup Summary

1. Install JDK 17 from https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. Set `JAVA_HOME = C:\Program Files\Java\jdk-17.0.X`
3. Install Android Studio from https://developer.android.com/studio
4. Set `ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk`
5. Add to PATH: `%ANDROID_HOME%\platform-tools`, `%ANDROID_HOME%\tools`, `%ANDROID_HOME%\emulator`
6. Create Android Emulator in Android Studio
7. Restart PowerShell
8. Run `npm start` and `npm run android`

---

## ✅ After Setup

Once you complete these steps, your app should build and launch on the Android emulator!

```
✅ npm start → Metro bundler runs
✅ npm run android → App builds and launches
✅ See login screen with your app!
```
