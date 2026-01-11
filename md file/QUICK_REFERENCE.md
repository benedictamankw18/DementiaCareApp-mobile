# 🚀 Quick Reference: Common Commands

## Development Workflow

### Start Development

```powershell
cd D:\eric\Project\DementiaCareApp
npm start
```

→ Starts Metro bundler. Keep this terminal open.

### Run on Android Emulator (New Terminal)

```powershell
npm run android
```

→ Builds and launches app on Android emulator.

### Reset Cache & Rebuild

```powershell
npm start -- --reset-cache
```

→ Clear cached bundles and rebuild from scratch.

---

## Firebase Configuration

### Update Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Copy config
3. Paste into `firebase.config.js` (lines 11-18)

### Test Firebase Connection

```powershell
# Look for "Firebase app initialized" message
npm start | Select-String "Firebase" -ErrorAction SilentlyContinue
```

---

## Testing

### Run Login Test

```
1. npm start
2. npm run android
3. Navigate to Signup screen
4. Create account: test@example.com / Password123
5. Should appear in Firebase Console → Authentication
6. Sign out and log back in
```

### Check Firebase Users

- Open [Firebase Console](https://console.firebase.google.com)
- Go to Authentication → Users
- Should show your test accounts

### View Firestore Data

- Open [Firebase Console](https://console.firebase.google.com)
- Go to Firestore Database
- Should see "users" collection with your account

---

## Dependencies

### Install All Dependencies

```powershell
npm install
```

### Add New Package

```powershell
npm install <package-name>
```

Example:

```powershell
npm install react-native-maps
```

### Update Packages

```powershell
npm update
```

---

## Debugging

### View Logs

```powershell
npm start
```

→ Logs appear in terminal.

### Clear Android Build Cache

```powershell
cd android
./gradlew clean
cd ..
npm run android
```

### Clear App Data (Android)

```powershell
npm run android -- --reset-cache
```

### Kill Metro Bundler

```powershell
# Windows: Press Ctrl+C in the npm start terminal
# Or use:
taskkill /IM node.exe /F
```

---

## File Editing

### Update Firebase Config

```
File: firebase.config.js
Lines to edit: 11-18
Keep: All other code as-is
Restart: npm start after changes
```

### Create New Screen

```powershell
# Create file
New-Item -Path src/screens/patient/NewScreen.js -ItemType File

# Template content
Write-Host "@component
import React from 'react'
import { View } from 'react-native'
import theme from '../../styles/theme'

export default function NewScreen() {
  return (
    <View style={{flex:1, backgroundColor: theme.colors.background}}>
      {/* Your UI here */}
    </View>
  )
}"
```

---

## Project Structure Verification

### Check Folder Structure

```powershell
cd D:\eric\Project\DementiaCareApp
Get-ChildItem -Path src -Recurse -Directory | Select-Object FullName
```

### List All JavaScript Files

```powershell
Get-ChildItem -Path src -Recurse -Filter "*.js" | Select-Object Name
```

### Verify Critical Files

```powershell
Test-Path "firebase.config.js"           # Should be True
Test-Path "App.js"                       # Should be True
Test-Path "src/services/authService.js"  # Should be True
Test-Path "android/app/google-services.json"  # Should be True
```

---

## Common Errors & Fixes

| Error                           | Cause                               | Fix                                  |
| ------------------------------- | ----------------------------------- | ------------------------------------ |
| `Cannot find module 'firebase'` | Dependencies not installed          | `npm install`                        |
| `Firebase config is empty`      | firebase.config.js has placeholders | Update with real credentials         |
| `Metro bundler crash`           | Cached files corrupted              | `npm start -- --reset-cache`         |
| `Android emulator won't start`  | Emulator not running                | Open Android Studio → Start emulator |
| `Execution policy error`        | PowerShell restrictions             | `Set-ExecutionPolicy RemoteSigned`   |
| `Port 8081 already in use`      | Metro already running               | Close other npm start terminal       |

---

## Documentation Files (In Project)

```
D:\eric\Project\DementiaCareApp\
├── README.md (auto-generated)
├── SYSTEM_ARCHITECTURE.md ← Project design
├── FIRESTORE_DATABASE_SCHEMA.md ← Database structure
├── PROJECT_SETUP_GUIDE.md ← Installation steps
├── FIREBASE_SETUP_GUIDE.md ← Firebase credentials
├── IMPLEMENTATION_STATUS.md ← Next steps
├── IMPLEMENTATION_COMPLETE.md ← Full overview
└── QUICK_REFERENCE.md (this file)
```

---

## Editor Tips (VS Code)

### Open Project

```powershell
code D:\eric\Project\DementiaCareApp
```

### Format Code

```
Ctrl+Shift+P → Format Document
```

### Find in Files

```
Ctrl+Shift+F → Search across project
```

### Go to File

```
Ctrl+P → Type filename
```

### Terminal in VS Code

```
Ctrl+` → Open integrated terminal
```

---

## Git Commands (If Using Version Control)

```powershell
# Initialize repo
git init

# Add files
git add .

# Commit changes
git commit -m "Initial implementation"

# Check status
git status

# View log
git log --oneline
```

---

## Performance Tips

1. **Keep Metro running** - Don't stop `npm start` during development
2. **Use Android device** - Emulator can be slow; test on real device
3. **Hot reload** - Changes auto-reload without full rebuild
4. **Disable Hermes** - If slow, disable in android/app/build.gradle
5. **Increase emulator RAM** - 4GB minimum in Android Studio

---

## Before Submission

- [ ] Update firebase.config.js with real credentials
- [ ] Test all screens work on Android
- [ ] Verify Firestore rules are set to test mode
- [ ] Check all documentation is complete
- [ ] Create git commit with final code
- [ ] Take screenshots for report
- [ ] Document any known issues
- [ ] Build release APK: `npm run android -- --variant=release`

---

## Useful Links

| Resource          | URL                                  |
| ----------------- | ------------------------------------ |
| Firebase Console  | https://console.firebase.google.com  |
| React Native Docs | https://reactnative.dev/docs         |
| React Navigation  | https://reactnavigation.org/docs     |
| Material Design   | https://material.io/design           |
| Android Studio    | https://developer.android.com/studio |
| VS Code           | https://code.visualstudio.com        |

---

**Last Updated:** January 7, 2026  
**Status:** ✅ Ready for Development

Keep this file open while developing! 📋
