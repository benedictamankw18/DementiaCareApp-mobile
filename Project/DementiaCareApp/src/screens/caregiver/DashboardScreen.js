/**
 * Caregiver Dashboard Screen
 * Dementia Care Mobile Application
 * 
 * Shows list of patients under care, recent alerts, and quick stats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { getCaregiverPatients } from '../../services/caregiverService';
import { getPatientReminders, getPatientActivityHistory } from '../../services/firestoreService';
import { getRecentSOSAlerts } from '../../services/sosAlertService';
import { t } from '../../services/i18nService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const DashboardScreen = ({ navigation, route }) => {
  const currentUser = auth().currentUser;
  const caregiverId = route?.params?.caregiverId || currentUser?.uid;
  const { colors: themeColors } = useTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!caregiverId) return;

    console.log('[DashboardScreen] Setting up dashboard for caregiver:', caregiverId);
    
    let unsubscribers = [];
    let isMounted = true;
    let caregiverPatients = [];

    const setupDashboard = async () => {
      try {
        // Load initial data
        setLoading(true);
        caregiverPatients = await getCaregiverPatients(caregiverId);
        console.log('[DashboardScreen] Got caregiver patients:', caregiverPatients.map(p => ({ id: p.id, name: p.fullName })));
        
        if (!isMounted) return;

        // Set up real-time listeners for each patient's location BEFORE loading data
        caregiverPatients.forEach((patient) => {
          console.log(`[DashboardScreen] Setting up listener for patient ${patient.id}`);
          
          const unsubscribe = firestore()
            .collection('patients')
            .doc(patient.id)
            .onSnapshot(
              (doc) => {
                console.log(`[DashboardScreen] Snapshot received for patient ${patient.id}:`, doc.exists ? 'exists' : 'not found');
                
                if (!isMounted) {
                  console.log(`[DashboardScreen] Component unmounted, ignoring update for ${patient.id}`);
                  return;
                }
                
                if (doc.exists) {
                  const data = doc.data();
                  console.log(`[DashboardScreen] Patient ${patient.id} data:`, { 
                    hasCurrentLocation: !!data.currentLocation,
                    address: data.currentLocation?.address
                  });
                  
                  if (data.currentLocation) {
                    const loc = data.currentLocation;
                    let locationDisplay = 'Unknown';
                    
                    if (loc.address) {
                      locationDisplay = loc.address;
                    } else if (loc.latitude && loc.longitude) {
                      locationDisplay = `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
                    }
                    
                    console.log(`[DashboardScreen] Updating location for patient ${patient.id}:`, locationDisplay);
                    
                    setPatients((prevPatients) => {
                      return prevPatients.map((p) => {
                        if (p.id === patient.id) {
                          console.log(`[DashboardScreen] Mapped patient ${patient.id} location to:`, locationDisplay);
                          return { ...p, location: locationDisplay };
                        }
                        return p;
                      });
                    });
                  } else {
                    console.log(`[DashboardScreen] No currentLocation in patient ${patient.id} data`);
                  }
                } else {
                  console.log(`[DashboardScreen] Patient document ${patient.id} does not exist`);
                }
              },
              (error) => {
                console.error(`[DashboardScreen] Listener error for patient ${patient.id}:`, error);
              }
            );
          
          unsubscribers.push(unsubscribe);
        });

        // Now load complete patient data with initial locations
        await loadData();
      } catch (error) {
        console.error('[DashboardScreen] Error setting up dashboard:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupDashboard();

    // Cleanup function
    return () => {
      console.log('[DashboardScreen] Cleaning up listeners');
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [caregiverId]);

  // Format timestamp to "X time ago"
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'recently';
    
    const now = new Date();
    const pastTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - pastTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return 'a week ago';
  };

  const loadData = async () => {
    try {
      // Fetch patients assigned to this caregiver
      const caregiverPatients = await getCaregiverPatients(caregiverId);
      
      // Fetch reminders and activity for each patient to get status
      const patientsWithStatus = await Promise.all(
        caregiverPatients.map(async (patient) => {
          try {
            const reminders = await getPatientReminders(patient.id);
            const pendingReminders = reminders.filter(r => !r.isCompleted);
            
            // Get last activity to determine status
            const activities = await getPatientActivityHistory(patient.id, 1);
            const lastActivity = activities[0];
            
            // Fetch current location from patients collection
            let locationDisplay = 'Unknown';
            try {
              const patientDoc = await firestore()
                .collection('patients')
                .doc(patient.id)
                .get();
              
              if (patientDoc.exists && patientDoc.data().currentLocation) {
                const loc = patientDoc.data().currentLocation;
                locationDisplay = loc.address || `${loc.latitude?.toFixed(4)}, ${loc.longitude?.toFixed(4)}` || 'Unknown';
                console.log(`[loadData] Patient ${patient.id} location:`, locationDisplay);
              } else {
                console.warn(`[loadData] No currentLocation found for patient ${patient.id}`);
              }
            } catch (locError) {
              console.warn(`Could not fetch location for patient ${patient.id}:`, locError);
            }
            
            return {
              id: patient.id,
              name: patient.fullName || 'Patient',
              status: lastActivity ? 'active' : 'idle',
              lastSeen: lastActivity ? formatTimeAgo(lastActivity.timestamp) : 'never',
              location: locationDisplay,
              remindersPending: pendingReminders.length,
              avatar: 'account-circle',
            };
          } catch (error) {
            console.error(`Error loading data for patient ${patient.id}:`, error);
            return {
              id: patient.id,
              name: patient.fullName || 'Patient',
              status: 'offline',
              lastSeen: 'unknown',
              location: 'Unknown',
              remindersPending: 0,
              avatar: 'account-circle',
            };
          }
        })
      );
      
      setPatients(patientsWithStatus);
      console.log('[loadData] Patients loaded:', patientsWithStatus);
      
      
      // Fetch recent SOS alerts for this caregiver
      const sosAlerts = await getRecentSOSAlerts(caregiverId, 10);
      
      console.log('[DashboardScreen] Fetched SOS alerts:', sosAlerts);
      
      // Create a map of patient names for quick lookup
      const patientNameMap = {};
      caregiverPatients.forEach(patient => {
        patientNameMap[patient.id] = patient.fullName || 'Patient';
      });
      
      const fetchedAlerts = sosAlerts.map((alert) => ({
        id: alert.id,
        type: alert.type || 'sos',
        // Use patient name from loaded patients first, then from alert, then fallback
        patient: patientNameMap[alert.patientId] || alert.patientName || 'Patient',
        message: alert.message || 'Emergency SOS triggered',
        time: formatTimeAgo(alert.timestamp),
        severity: alert.severity === 'critical' ? 'critical' : 'warning',
        timestamp: alert.timestamp,
        location: alert.location,
        reason: alert.reason,
      }));
      
      // Keep only top 5 most recent
      setAlerts(fetchedAlerts.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert(t('common.error'), t('dashboard.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePatientPress = (patient) => {
    // Navigate to patient detail or activity screen
    navigation.navigate('PatientActivity', { patientId: patient.id, patientName: patient.name });
  };

  const handleViewLocation = (patient) => {
    navigation.navigate('Location', { patientId: patient.id, patientName: patient.name });
  };

  const PatientCard = ({ item, themeColors }) => (
    <Card style={[styles.patientCard, { backgroundColor: themeColors.surface }]}>
      <Card.Content>
        <View style={styles.patientHeader}>
          <Avatar.Icon size={50} icon={item.avatar} color={themeColors.primary} />
          <View style={styles.patientInfo}>
            <Text style={[typography.heading3, { color: themeColors.text }]}>{item.name}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? colors.success : colors.warning }]} />
              <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>{item.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Icon name="clock" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>{item.lastSeen}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Icon name="map-marker" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>{item.location}</Text>
        </View>

        {item.remindersPending > 0 && (
          <View style={[styles.detailsRow, { marginTop: spacing.sm }]}>
            <Icon name="bell" size={16} color={colors.warning} />
            <Text style={[styles.detailText, { color: colors.warning }]}>
              {item.remindersPending} pending reminder{item.remindersPending !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handlePatientPress(item)}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {t('dashboard.activity')}
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleViewLocation(item)}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {t('dashboard.location')}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const AlertCard = ({ item, themeColors }) => (
    <Card style={[styles.alertCard, { backgroundColor: themeColors.surface, borderLeftColor: item.severity === 'critical' ? colors.error : colors.warning }]}>
      <Card.Content>
        <View style={styles.alertHeader}>
          <Icon
            name={item.severity === 'critical' ? 'alert-circle' : 'alert'}
            size={24}
            color={item.severity === 'critical' ? colors.error : colors.warning}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.heading4, { color: themeColors.text }]}>{item.patient}</Text>
            <Text style={[styles.alertMessage, { color: themeColors.textSecondary }]}>{item.message}</Text>
            <Text style={[styles.alertTime, { color: themeColors.textLight }]}>{item.time}</Text>
            
            {item.location && item.location.latitude && (
              <View style={styles.locationInfo}>
                <Icon name="map-marker" size={16} color={colors.primary} />
                <Text style={[styles.locationText, { color: themeColors.textSecondary }]}>
                  {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                </Text>
                {item.location.accuracy && (
                  <Text style={[styles.accuracyText, { color: themeColors.textLight }]}>
                    ±{item.location.accuracy}m
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        {item.location && item.location.latitude && (
          <Button
            mode="text"
            compact
            icon="map"
            onPress={() => {
              const url = `https://maps.google.com/?q=${item.location.latitude},${item.location.longitude}`;
              Linking.openURL(url).catch(() => {
                Alert.alert(t('common.error'), t('dashboard.couldNotOpenMaps'));
              });
            }}
            style={styles.mapButton}
          >
            {t('sos.viewOnMap')}
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={[styles.headerSection, { backgroundColor: themeColors.primary }]}>
        <Text style={[typography.heading2, { color: themeColors.white }]}>{t('dashboard.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: themeColors.textLight }]}>{t('dashboard.subtitle')}</Text>
      </View>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>{t('dashboard.recentAlerts')}</Text>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} item={alert} themeColors={themeColors} />
          ))}
        </View>
      )}

      {/* Patients Section */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle, { color: themeColors.text }]}>
          {t('dashboard.yourPatients')} ({patients.length})
        </Text>
        {patients.length === 0 ? (
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{t('dashboard.noPatients')}</Text>
        ) : (
          patients.map((patient) => (
            <PatientCard key={patient.id} item={patient} themeColors={themeColors} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.lightGray,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.text,
  },
  patientCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  patientInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    color: colors.gray,
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    marginLeft: spacing.sm,
    fontSize: 13,
    color: colors.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.48,
  },
  buttonLabel: {
    fontSize: 12,
  },
  alertCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  locationText: {
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
    fontSize: 12,
    fontWeight: '500',
  },
  accuracyText: {
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  mapButton: {
    marginTop: spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertMessage: {
    fontSize: 13,
    color: colors.text,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  alertTime: {
    fontSize: 11,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default DashboardScreen;
