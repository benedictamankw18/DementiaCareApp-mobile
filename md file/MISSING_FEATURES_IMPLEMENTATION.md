# Missing Features Implementation Guide

## Overview

Completed implementation of all critical missing features for the Dementia Care Application:

1. ✅ **SOS Alert System** - Emergency alerts from patients to caregivers
2. ✅ **Push Notifications** - Firebase Cloud Messaging integration
3. ✅ **Map Integration** - Location visualization with react-native-maps
4. ✅ **Geofencing** - Safe zone detection and alerts

---

## 1. SOS Alert System

### Service File: `sosAlertService.js`

**Key Functions:**

#### `triggerSOSAlert(patientId, patientName, location, reason)`

- Triggered by patient when they need emergency help
- Creates alert in patient's alerts collection
- Retrieves assigned caregivers from patient document
- Sends notifications to all assigned caregivers
- Logs alert for emergency records

**Parameters:**

```javascript
{
  patientId: string,        // Patient's unique ID
  patientName: string,      // Patient's full name
  location: {               // Optional current location
    latitude: number,
    longitude: number,
    address: string
  },
  reason: string            // Reason for SOS (optional, defaults to "Emergency")
}
```

**Returns:** `Promise<boolean>` - Success status

#### `acknowledgeSOSAlert(patientId, alertId, caregiverId)`

- Called when caregiver responds to SOS alert
- Marks alert as acknowledged
- Records responder information
- Tracks response time

#### `getRecentSOSAlerts(caregiverId, limit)`

- Retrieves recent unacknowledged SOS alerts
- Filters by caregiver's assigned patients
- Sorted by most recent first
- Default limit: 10 alerts

### Component: `SOSAlertButton.js`

**Features:**

- Large, prominent red emergency button
- Confirmation modal to prevent accidental triggers
- Optional reason/description input
- Loading state during submission
- Success feedback with caregiver notification message

**Usage in Patient Screens:**

```javascript
import SOSAlertButton from '../../components/SOSAlertButton';

<SOSAlertButton
  patientId={userId}
  patientName={userName}
  onSuccess={() => {
    // Handle successful SOS trigger
  }}
/>;
```

**Firestore Structure:**

```
patients/{patientId}
├── alerts/{alertId}
│   ├── type: "sos"
│   ├── severity: "critical"
│   ├── message: string
│   ├── reason: string
│   ├── location: {latitude, longitude, address}
│   ├── timestamp: serverTimestamp
│   ├── acknowledged: boolean
│   └── responders: [{caregiverId, respondedAt}]

alertLogs/{logId}
├── patientId: string
├── patientName: string
├── type: "sos"
├── severity: "critical"
├── message: string
├── caregiverIds: string[]
└── timestamp: serverTimestamp
```

---

## 2. Push Notifications (FCM)

### Service File: `pushNotificationService.js`

**Key Functions:**

#### `initializePushNotifications(userId)`

- Request user permission for notifications
- Get FCM device token
- Setup foreground message handler
- Setup background notification click handler
- Setup token refresh listener
- Subscribe to default topics

**Must be called in App.js or auth context after user logs in**

#### `saveDeviceToken(userId, token)`

- Saves device token to patient or caregiver document
- Checks both collections to determine user type
- Stores in `deviceTokens` array for multi-device support
- Updates `lastTokenUpdate` timestamp

#### `subscribeToTopic(topic)` / `unsubscribeFromTopic(topic)`

- Subscribe/unsubscribe from notification topics
- Useful for group notifications (e.g., all caregivers of a patient)

**Notification Types Supported:**

```javascript
// SOS Alert
{
  type: 'sos',
  patientId: string,
  patientName: string,
  message: string
}

// Reminder Alert
{
  type: 'reminder',
  reminderId: string,
  patientId: string,
  reminderType: string,
  dueTime: string
}

// General Alert
{
  type: 'alert',
  severity: 'critical|warning|info',
  message: string,
  patientId: string
}
```

**Setup Steps:**

1. **Call in App.js after authentication:**

```javascript
import { initializePushNotifications } from './src/services/pushNotificationService';

useEffect(() => {
  if (state.userToken && state.userId) {
    initializePushNotifications(state.userId);
  }
}, [state.userToken, state.userId]);
```

2. **Configure android/app/build.gradle:**

```gradle
dependencies {
  implementation 'com.google.firebase:firebase-messaging'
}
```

3. **Backend Setup (Node.js/Cloud Functions):**

```javascript
// Send notification to device
const message = {
  notification: {
    title: 'SOS Alert',
    body: `${patientName} needs help immediately`,
  },
  data: {
    type: 'sos',
    patientId: patientId,
    patientName: patientName,
  },
  token: deviceToken,
};

await admin.messaging().send(message);
```

**Firestore Structure:**

```
patients/{patientId}
├── deviceTokens: string[]
└── lastTokenUpdate: timestamp

caregivers/{caregiverId}
├── deviceTokens: string[]
└── lastTokenUpdate: timestamp
```

---

## 3. Map Integration

### Package: `react-native-maps`

**Installation:** ✅ Completed (`npm install react-native-maps --save`)

**Updated Component: `LocationScreen.js`**

**Features:**

- MapView component showing current patient location
- Marker for current location with custom pin color
- Circle overlays for safe zones with 500m radius
- Markers for each safe zone
- Real-time map updates on location refresh
- Location history list below map
- Safe zones management

**Map Display:**

```javascript
<MapView
  style={styles.map}
  initialRegion={{
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  {/* Current Location Marker */}
  <Marker
    coordinate={{
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    }}
    title={patientName}
    description={currentLocation.address}
    pinColor={colors.primary}
  />

  {/* Safe Zone Circles */}
  {safeZones.map(zone => (
    <Circle
      key={zone.id}
      center={{
        latitude: zone.latitude,
        longitude: zone.longitude,
      }}
      radius={zone.radius}
      fillColor="rgba(76, 175, 80, 0.2)"
      strokeColor={colors.success}
      strokeWidth={2}
    />
  ))}
</MapView>
```

**Android Permissions (AndroidManifest.xml):**

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**Android Metadata (AndroidManifest.xml):**

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

**iOS Configuration (ios/Podfile):**

```ruby
pod 'react-native-maps', path: '../node_modules/react-native-maps'
```

---

## 4. Geofencing Service

### Service File: `geofencingService.js`

**Key Functions:**

#### `calculateDistance(lat1, lon1, lat2, lon2)`

- Uses Haversine formula for accurate distance calculation
- Returns distance in kilometers
- Used internally for geofence detection

#### `addSafeZone(patientId, zone)`

Creates a safe zone for a patient

```javascript
const zone = {
  name: 'Home',
  latitude: 40.7489,
  longitude: -73.968,
  radius: 500, // in meters, default 500m
};

const zoneId = await addSafeZone(patientId, zone);
```

#### `getPatientSafeZones(patientId)`

- Retrieves all active safe zones for patient
- Returns array of zone objects with IDs

#### `checkLocationInSafeZone(patientId, currentLat, currentLon)`

Returns:

```javascript
{
  isInSafeZone: boolean,
  zone: {id, name, latitude, longitude, radius},
  distance: number  // in km
}
```

#### `logLocationAndCheckGeofence(patientId, patientName, latitude, longitude, address)`

- Logs location to Firestore
- Checks if in any safe zone
- **Automatically creates geofence alert if outside all zones**
- Returns: `boolean` - whether alert was created

**Usage in Location Tracking:**

```javascript
import { logLocationAndCheckGeofence } from '../../services/geofencingService';

// Call when patient location updates
const alertCreated = await logLocationAndCheckGeofence(
  patientId,
  patientName,
  location.latitude,
  location.longitude,
  location.address,
);

if (alertCreated) {
  console.log('Patient left safe zone - alert sent to caregivers');
}
```

#### `updateSafeZone(patientId, zoneId, updates)`

- Modify safe zone properties
- Returns: boolean - success status

#### `deleteSafeZone(patientId, zoneId)`

- Remove safe zone
- Returns: boolean - success status

#### `getGeofenceAlerts(caregiverId, limit)`

- Get all geofence alerts for caregiver's patients
- Sorted by most recent first
- Default limit: 10 alerts

**Firestore Structure:**

```
patients/{patientId}
├── locations/{locationId}
│   ├── latitude: number
│   ├── longitude: number
│   ├── address: string
│   ├── accuracy: number
│   └── timestamp: serverTimestamp
├── safeZones/{zoneId}
│   ├── name: string
│   ├── latitude: number
│   ├── longitude: number
│   ├── radius: number (meters)
│   ├── active: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
└── alerts/{alertId}
    ├── type: "geofence"
    ├── severity: "warning"
    ├── message: string
    ├── location: {latitude, longitude, address}
    ├── timestamp: serverTimestamp
    └── acknowledged: boolean
```

---

## Integration Checklist

### For Patient App:

- [ ] Add `SOSAlertButton` to patient home screen
- [ ] Call `initializePushNotifications(userId)` after login
- [ ] Implement background location tracking
- [ ] Call `logLocationAndCheckGeofence()` periodically (every 5-10 minutes)
- [ ] Handle geofence alerts on client

### For Caregiver App:

- [ ] Display SOS alerts in dashboard alerts section
- [ ] Display geofence alerts in dashboard alerts section
- [ ] Update location map view (already done)
- [ ] Show safe zones on location map
- [ ] Implement safe zone management UI

### Backend (Cloud Functions):

- [ ] Create Cloud Function to send FCM notifications
- [ ] Create Cloud Function to aggregate alerts
- [ ] Setup scheduled tasks for location tracking validation
- [ ] Create alert acknowledgment endpoints

---

## Testing Recommendations

### SOS Alert:

1. Trigger SOS from patient device
2. Verify notification appears on caregiver device
3. Acknowledge from caregiver side
4. Verify status updates on both sides

### Geofencing:

1. Create safe zones with coordinates
2. Move patient location outside zones
3. Verify geofence alert is created
4. Return to safe zone
5. Verify no new alert on re-entry

### Push Notifications:

1. Send test notification while app in foreground
2. Send test notification while app in background
3. Tap notification and verify navigation
4. Check token refresh on app restart

### Maps:

1. Verify map loads with current location
2. Check safe zone circles display correctly
3. Verify zoom/pan interactions
4. Test on different screen sizes

---

## Next Steps

1. **Backend Implementation**: Create Cloud Functions for sending FCM notifications
2. **Background Tasks**: Setup background location tracking (react-native-background-task)
3. **Patient UI**: Add SOS button and location tracking to patient screens
4. **Safe Zone Management**: Create UI for caregivers to add/edit/delete safe zones
5. **Testing**: Comprehensive testing of all features
6. **Deployment**: Deploy Cloud Functions and update Android/iOS apps
