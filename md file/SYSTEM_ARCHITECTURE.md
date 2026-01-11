# DEMENTIA CARE MOBILE APPLICATION

## System Architecture Design

**Project Title:** Design and Development of a Dementia Care Mobile Application for Patient and Caregiver Support

**Academic Level:** Final Year Project

---

## 1. SYSTEM OVERVIEW

### 1.1 Architecture Pattern

**Pattern Used:** Cloud-Based Client-Server Architecture with Role-Based Access Control

The system follows a **three-tier architecture**:

- **Presentation Tier:** React Native mobile application (Patient & Caregiver clients)
- **Business Logic Tier:** Firebase Cloud Functions (serverless)
- **Data Tier:** Firebase (Firestore Database, Authentication, Cloud Messaging)

### 1.2 High-Level System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE DEVICES                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐        ┌──────────────────┐           │
│  │  PATIENT APP     │        │  CAREGIVER APP   │           │
│  │  (React Native)  │        │  (React Native)  │           │
│  │                  │        │                  │           │
│  │ - Reminders      │        │ - Monitor        │           │
│  │ - Tasks          │        │ - Alerts         │           │
│  │ - Memory Prompts │        │ - History        │           │
│  │ - SOS Button     │        │ - Location       │           │
│  │ - Games          │        │ - Manage         │           │
│  │ - GPS Tracking   │        │                  │           │
│  └────────┬─────────┘        └────────┬─────────┘           │
└───────────┼──────────────────────────┼─────────────────────┘
            │                          │
            │   HTTPS REST API         │
            │   Firebase SDK           │
            └──────────────┬───────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │   FIREBASE BACKEND SERVICES        │
         ├────────────────────────────────────┤
         │                                    │
         │  ┌──────────────────────────────┐  │
         │  │ Firebase Authentication      │  │
         │  │ - Email/Password Auth        │  │
         │  │ - JWT Token Management       │  │
         │  │ - Role Verification          │  │
         │  └──────────────────────────────┘  │
         │                                    │
         │  ┌──────────────────────────────┐  │
         │  │ Cloud Firestore Database     │  │
         │  │ - Users Collection           │  │
         │  │ - Reminders Collection       │  │
         │  │ - Activities Collection      │  │
         │  │ - GPS Locations Collection   │  │
         │  │ - Consent Records Collection │  │
         │  └──────────────────────────────┘  │
         │                                    │
         │  ┌──────────────────────────────┐  │
         │  │ Firebase Cloud Messaging     │  │
         │  │ - Push Notifications         │  │
         │  │ - Emergency Alerts           │  │
         │  │ - Real-time Updates          │  │
         │  └──────────────────────────────┘  │
         │                                    │
         │  ┌──────────────────────────────┐  │
         │  │ Cloud Firestore Security     │  │
         │  │ - Role-Based Rules           │  │
         │  │ - Data Encryption            │  │
         │  │ - Access Control             │  │
         │  └──────────────────────────────┘  │
         │                                    │
         └────────────────────────────────────┘
```

---

## 2. SYSTEM COMPONENTS

### 2.1 Frontend Layer (React Native Application)

#### **Patient Application**

**Purpose:** Primary interface for individuals living with dementia

**Key Features:**

- Large, high-contrast UI (18-22pt minimum font)
- Simplified navigation with large touch targets (min 44x44 dp)
- Minimal cognitive load
- Real-time location tracking (with consent)
- Emergency SOS functionality
- Reminder notifications
- Memory games and prompts

**Technology:**

- React Native (cross-platform iOS/Android)
- React Native Paper (Material Design UI components)
- Redux (state management)
- AsyncStorage (local data caching)
- Geolocation APIs (GPS tracking)
- Push Notifications (Firebase Cloud Messaging)

#### **Caregiver Application**

**Purpose:** Monitoring and management interface for caregivers and family members

**Key Features:**

- Patient activity monitoring dashboard
- Real-time location tracking (consent-based)
- Emergency alert notifications
- Medication adherence tracking
- Reminder management (create/edit/delete)
- Activity history view
- Communication features

**Technology:**

- React Native (same codebase with role-based UI)
- Firebase Realtime Database listeners
- Map libraries for location visualization
- Charts/graphs for activity analytics

### 2.2 Backend Layer (Firebase Services)

#### **Firebase Authentication Module**

**Responsibility:** Secure user authentication and authorization

**Features:**

- Email/password authentication
- Session token management (JWT)
- Role-based access control verification
- Password reset functionality
- Account linking (Caregiver to Patient)

**Security Implementation:**

- Passwords hashed server-side
- SSL/TLS encryption for all communications
- Token expiration (refresh tokens every 24 hours)
- Rate limiting on login attempts

#### **Cloud Firestore Database Module**

**Responsibility:** Persistent data storage with real-time synchronization

**Collections:**

1. **Users** - User profiles and authentication metadata
2. **Reminders** - Medication and task reminders
3. **Activities** - Patient activity logs
4. **GPS_Locations** - Real-time location data
5. **Consent_Records** - Explicit consent for data sharing
6. **Caregiver_Relationships** - Caregiver-to-patient mappings

#### **Firebase Cloud Messaging (FCM)**

**Responsibility:** Real-time notifications and alerts

**Use Cases:**

- Reminder notifications to patient
- Emergency SOS alerts to caregivers
- Medication adherence reminders
- System updates
- New activity notifications

#### **Cloud Functions (Optional, for future enhancement)**

**Responsibility:** Server-side logic for complex operations

**Potential Functions:**

- Scheduled reminder triggers
- Activity logging automation
- Emergency alert distribution
- GPS location processing

### 2.3 Data Tier (Cloud Firestore)

**Database Type:** NoSQL Document-Based Database

**Advantages for this project:**

- Real-time synchronization between client and server
- Offline-first capability (works without internet)
- Automatic data backup and recovery
- Scalable to support multiple users simultaneously
- Built-in security rules

---

## 3. DATA FLOW ARCHITECTURE

### 3.1 User Authentication Flow

```
Patient/Caregiver
       │
       ▼
   ┌─────────────────────────────┐
   │ Enter Email & Password      │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Firebase Auth Service       │
   │ - Verify credentials        │
   │ - Generate JWT Token        │
   │ - Return auth result        │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Extract User Role from DB   │
   │ - Query Users collection    │
   │ - Verify role (Patient/     │
   │   Caregiver)                │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Load Role-Specific UI       │
   │ - Initialize state          │
   │ - Set up listeners          │
   │ - Cache token locally       │
   └─────────────────────────────┘
```

### 3.2 Reminder Notification Flow

```
Reminder Created (Caregiver)
       │
       ▼
   ┌─────────────────────────────┐
   │ Save to Firestore           │
   │ Reminders Collection        │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Schedule Notification       │
   │ - Set trigger time          │
   │ - Create notification data  │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Send via Firebase Cloud     │
   │ Messaging (FCM)             │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Patient Receives Alert      │
   │ - Display notification      │
   │ - Log activity              │
   │ - Update status in DB       │
   └─────────────────────────────┘
```

### 3.3 Emergency SOS Flow

```
Patient Taps SOS Button
       │
       ▼
   ┌─────────────────────────────┐
   │ Capture Current Data        │
   │ - GPS location              │
   │ - Patient ID                │
   │ - Timestamp                 │
   │ - Patient name              │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Create Emergency Record     │
   │ in Firestore Activities     │
   │ Collection                  │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Query Linked Caregivers     │
   │ from Users collection       │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Send FCM Notifications      │
   │ - To all caregivers         │
   │ - With location info        │
   │ - Mark as HIGH priority     │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Caregiver Receives Alert    │
   │ - Full-screen notification  │
   │ - Can view location         │
   │ - Can contact patient       │
   └─────────────────────────────┘
```

### 3.4 Location Tracking Flow

```
Patient Enables GPS Tracking (with Consent)
       │
       ▼
   ┌─────────────────────────────┐
   │ Request Location Permission │
   │ - User grants access        │
   │ - Create consent record     │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Background Location Service │
   │ - Runs every 5-10 minutes   │
   │ - Gets GPS coordinates      │
   │ - Calculates accuracy       │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Save to GPS_Locations       │
   │ Collection (Firestore)      │
   │ - Timestamp                 │
   │ - Latitude/Longitude        │
   │ - Accuracy level            │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Caregiver Views Location    │
   │ - Real-time on map          │
   │ - Location history          │
   │ - Last known position       │
   └─────────────────────────────┘
```

---

## 4. ROLE-BASED ACCESS CONTROL (RBAC)

### 4.1 User Roles

| Role             | Permissions                                                                                      | Features                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Patient**      | Read own profile, submit activities, receive reminders, play games, trigger SOS                  | View reminders, activity tracking, games, emergency alert            |
| **Caregiver**    | Read linked patient data, create/manage reminders, view location, receive alerts, manage consent | Dashboard, patient monitoring, reminder management, activity history |
| **System Admin** | (Reserved for future)                                                                            | User management, system monitoring, reporting                        |

### 4.2 Firestore Security Rules Implementation

**Core Principle:** Users can only access data they own or are explicitly authorized to access

**Implementation Approach:**

```
Rules Structure:
- Users can read/write their own user document
- Patients can only read/write their own reminders and activities
- Caregivers can read patient data ONLY if linked relationship exists
- All GPS data readable only by authorized caregivers
- Consent records govern all data sharing permissions
```

---

## 5. DATABASE ARCHITECTURE

### 5.1 Firestore Collections Structure

#### **Users Collection**

```
/users/{userId}
├── email: string
├── fullName: string
├── role: string ("patient" | "caregiver")
├── phoneNumber: string
├── profilePhoto: string (URL)
├── dateOfBirth: timestamp
├── createdAt: timestamp
├── linkedPatient: string (for caregivers - patient userId)
├── linkedCaregivers: array (for patients - caregiver userIds)
├── emergencyContacts: array
└── preferences: map
    ├── notificationsEnabled: boolean
    ├── fontSize: number (18-22)
    ├── highContrast: boolean
    └── locationSharingEnabled: boolean
```

#### **Reminders Collection**

```
/reminders/{reminderId}
├── patientId: string
├── caregiverId: string (creator)
├── type: string ("medication" | "task" | "activity")
├── title: string
├── description: string
├── scheduledTime: timestamp
├── frequency: string ("once" | "daily" | "weekly")
├── recurrenceDay: array (for weekly reminders)
├── isCompleted: boolean
├── completedAt: timestamp
├── createdAt: timestamp
├── updatedAt: timestamp
└── notificationSettings: map
    ├── sound: boolean
    └── vibration: boolean
```

#### **Activities Collection**

```
/activities/{activityId}
├── patientId: string
├── activityType: string ("reminder_completed" | "game_played" | "sos_triggered")
├── title: string
├── description: string
├── timestamp: timestamp
├── metadata: map
│   ├── reminderId: string (if reminder-related)
│   ├── gameScore: number (if game-related)
│   └── locationCoordinates: map (if SOS-related)
├── views: map
│   ├── caregiverId: {
│   │   ├── viewedAt: timestamp
│   │   └── acknowledged: boolean
│   └── ...
└── isDeleted: boolean
```

#### **GPS_Locations Collection**

```
/gps_locations/{locationId}
├── patientId: string
├── latitude: number
├── longitude: number
├── accuracy: number (in meters)
├── timestamp: timestamp
├── address: string (reverse geocoding)
└── consentVerified: boolean
```

#### **Consent_Records Collection**

```
/consent_records/{consentId}
├── patientId: string
├── caregiverId: string
├── consentType: string ("location_tracking" | "activity_monitoring" | "reminder_management")
├── isGranted: boolean
├── grantedAt: timestamp
├── expiresAt: timestamp (optional)
├── notes: string
└── history: array (for audit trail)
    └── [{status, timestamp, notes}, ...]
```

#### **Caregiver_Relationships Collection**

```
/caregiver_relationships/{relationshipId}
├── patientId: string
├── caregiverId: string
├── relationshipType: string ("family" | "professional" | "friend")
├── linkedAt: timestamp
├── linkedBy: string (patientId or adminId)
├── status: string ("active" | "pending" | "revoked")
└── permissions: array
    ├── "view_location"
    ├── "manage_reminders"
    ├── "view_activities"
    └── "receive_emergencies"
```

---

## 6. SECURITY ARCHITECTURE

### 6.1 Authentication Security

| Security Measure           | Implementation                                          |
| -------------------------- | ------------------------------------------------------- |
| **Password Storage**       | Firebase handles password hashing (bcrypt) server-side  |
| **Session Tokens**         | JWT tokens with 24-hour expiration                      |
| **Token Refresh**          | Automatic token refresh using refresh tokens            |
| **Brute Force Protection** | Firebase built-in rate limiting (max 5 failed attempts) |
| **HTTPS Only**             | All Firebase communications encrypted with TLS          |

### 6.2 Data Security

| Security Measure               | Implementation                                              |
| ------------------------------ | ----------------------------------------------------------- |
| **At Rest Encryption**         | Firebase automatically encrypts all Firestore data          |
| **In Transit Encryption**      | TLS 1.2+ for all API communications                         |
| **Field-Level Access Control** | Firestore Security Rules enforce role-based access          |
| **Audit Logging**              | Consent records maintain full history of access             |
| **PII Protection**             | Sensitive data indexed carefully, avoid client-side logging |

### 6.3 Firestore Security Rules Strategy

**Principle:** Least Privilege Access

- Users cannot access data by default
- Explicit rules grant access only where needed
- Patient data protected by default
- Caregiver relationships verified before data sharing

---

## 7. COMMUNICATION ARCHITECTURE

### 7.1 Client-Server Communication

**Protocol:** HTTPS REST API (via Firebase SDK)

**Firebase SDK Methods:**

- `firebase.auth()` - Authentication
- `firebase.firestore()` - Database operations
- `firebase.messaging()` - Push notifications
- `firebase.storage()` - File uploads (future)

### 7.2 Real-Time Synchronization

**Firestore Listeners:**

- Patient app listens to own reminders and activities
- Caregiver app listens to linked patient's data
- Real-time updates propagate automatically
- Offline queue captures mutations for sync when online

### 7.3 Notification Channel Architecture

**Push Notification Types:**

| Type            | Priority | Recipient  | Trigger                    |
| --------------- | -------- | ---------- | -------------------------- |
| Reminder Alert  | High     | Patient    | Scheduled time             |
| Emergency SOS   | Critical | Caregivers | Patient triggers           |
| Medication Due  | High     | Patient    | Caregiver creates          |
| Activity Update | Medium   | Caregivers | Patient completes activity |
| System Alert    | Low      | All        | System events              |

---

## 8. SYSTEM FLOW SUMMARY

### 8.1 Key User Journeys

#### **Journey 1: Patient Receives Medication Reminder**

1. Caregiver creates reminder in app
2. Data saved to Firestore `reminders` collection
3. Scheduled notification triggered at time
4. Patient receives high-contrast notification
5. Patient taps reminder (large button)
6. Activity recorded in `activities` collection
7. Caregiver sees completion in dashboard

#### **Journey 2: Emergency Alert**

1. Patient taps large SOS button (easily accessible)
2. GPS location captured (if enabled)
3. Emergency record created in `activities`
4. All linked caregivers notified via FCM (critical priority)
5. Caregivers receive full-screen alert with location
6. Caregivers can contact patient, view location, call emergency services

#### **Journey 3: Location Tracking**

1. Patient (or caregiver) enables GPS with explicit consent
2. Consent record created in `consent_records`
3. Background service updates location every 5-10 minutes
4. Locations saved in `gps_locations` collection
5. Caregiver views real-time location on map
6. Location history available for review

---

## 9. SCALABILITY AND PERFORMANCE CONSIDERATIONS

### 9.1 Scalability Design

| Aspect               | Strategy                                                          |
| -------------------- | ----------------------------------------------------------------- |
| **User Growth**      | Firestore automatically scales; no server management needed       |
| **Concurrent Users** | Firebase handles concurrent connections; real-time sync optimized |
| **Data Growth**      | Collections indexed appropriately for query performance           |
| **Location Data**    | Automatic cleanup of old location records (retention policy)      |

### 9.2 Performance Optimization

| Strategy               | Implementation                                         |
| ---------------------- | ------------------------------------------------------ |
| **Offline-First**      | AsyncStorage caches critical data locally              |
| **Query Optimization** | Index frequently queried fields (patientId, timestamp) |
| **Batch Writes**       | Multiple reminders written in single transaction       |
| **Selective Sync**     | Only listen to necessary data streams                  |
| **Pagination**         | Activity history loaded in pages (not all at once)     |

---

## 10. DEPLOYMENT AND INFRASTRUCTURE

### 10.1 Cloud Architecture

**Firebase Project Setup:**

- Single Firebase project for centralized data management
- Firestore database in primary region (e.g., us-central1)
- Multi-region authentication for resilience
- Automatic backups (daily)
- CDN for static assets

### 10.2 Client Deployment

**Distribution:**

- Patient and Caregiver apps packaged as separate APKs (Android)
- Same React Native codebase with conditional rendering (role-based)
- Version management through app store or internal distribution

---

## 11. SYSTEM ARCHITECTURE JUSTIFICATION

### 11.1 Why This Architecture?

| Decision                   | Justification                                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Cloud-Based (Firebase)** | No server management, automatic scaling, real-time sync, secure by default, cost-effective for academic project             |
| **React Native**           | Cross-platform development, single codebase for Patient & Caregiver, strong community support, suitable for low-end devices |
| **Firestore NoSQL**        | Real-time synchronization, offline capability, flexible schema for dementia app variations, simple data model               |
| **Role-Based Access**      | Protects patient privacy, ensures caregivers see only authorized data, auditable for healthcare compliance                  |
| **Cloud Messaging (FCM)**  | Real-time alerts, reliable delivery, no need for persistent connections, battery efficient                                  |

### 11.2 Alternative Approaches Considered

| Alternative              | Why Not Used                                                                  |
| ------------------------ | ----------------------------------------------------------------------------- |
| Traditional SQL Database | Requires server infrastructure; less suited for real-time sync needs          |
| Custom REST API          | More complex to build; Firebase handles auth, security, scaling automatically |
| Native iOS/Android Apps  | Higher development cost; React Native achieves same goal with 50% less code   |

---

## 12. ARCHITECTURE STRENGTHS & LIMITATIONS

### 12.1 Strengths

✅ **Scalable** - Automatic scaling with user growth  
✅ **Secure** - Role-based access, encryption, audit trails  
✅ **Real-Time** - Instant synchronization between users  
✅ **Offline-First** - Works without internet (syncs when online)  
✅ **Cost-Effective** - Pay-per-use Firebase pricing  
✅ **Compliant** - Supports GDPR (data deletion), explicit consent mechanisms

### 12.2 Limitations

⚠️ **Firebase Dependency** - Vendor lock-in; switching cloud providers is difficult  
⚠️ **Latency** - Real-time updates depend on network connectivity  
⚠️ **Firestore Costs** - Can become expensive at scale (millions of reads/writes)  
⚠️ **Limited Server Logic** - Complex business logic requires Cloud Functions (additional cost)

---

## CONCLUSION

This cloud-based architecture provides a **secure, scalable, and maintainable solution** for a Dementia Care Mobile Application. The use of Firebase simplifies backend complexity, allowing focus on user experience and dementia-friendly design. Role-based access control ensures patient privacy while enabling effective caregiver support.

The architecture is **suitable for academic submission** as it demonstrates understanding of:

- Cloud architecture principles
- Security and data protection
- Real-time system design
- Role-based access control
- Scalability patterns

---

**Document Version:** 1.0  
**Date:** January 7, 2026  
**Status:** Ready for Project Report (Chapter 3)
