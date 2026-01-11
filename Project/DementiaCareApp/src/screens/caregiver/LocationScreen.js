/**
 * Location Screen
 * Dementia Care Mobile Application
 * 
 * Displays patient's current location and location history with map view
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { t } from '../../services/i18nService';
import { getLatestLocation } from '../../services/firestoreService';
import firestore from '@react-native-firebase/firestore';

const LocationScreen = ({ navigation, route }) => {
  const { patientId, patientName } = route?.params || {};
  const { colors: themeColors } = useTheme();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: patientName ? `${patientName}'s Location` : 'Patient Location',
    });
    loadLocationData();

    // Set up real-time listener for current location
    const unsubscribeLocation = firestore()
      .collection('patients')
      .doc(patientId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.currentLocation) {
              setCurrentLocation({
                latitude: data.currentLocation.latitude,
                longitude: data.currentLocation.longitude,
                address: data.currentLocation.address || 'Location detected',
                accuracy: data.currentLocation.accuracy || 10,
                timestamp: data.currentLocation.timestamp,
                status: 'active',
              });
            }
          }
        },
        (error) => {
          console.error('Error listening to location:', error);
        }
      );

    // Set up real-time listener for location history
    const unsubscribeHistory = firestore()
      .collection('patients')
      .doc(patientId)
      .collection('locations')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot(
        (snapshot) => {
          const history = [];
          snapshot.forEach((doc) => {
            const location = doc.data();
            history.push({
              id: doc.id,
              address: location.address || 'Unknown location',
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: location.timestamp,
              duration: location.duration || 'N/A',
              icon: 'map-marker',
              source: 'background',
            });
          });

          // Also fetch SOS alerts
          firestore()
            .collection('alertLogs')
            .where('patientId', '==', patientId)
            .where('type', '==', 'sos')
            .limit(40)
            .get()
            .then((sosSnapshot) => {
              const sosAlerts = sosSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(alert => alert.type === 'sos')
                .sort((a, b) => {
                  const timeA = a.timestamp?.toMillis?.() || 0;
                  const timeB = b.timestamp?.toMillis?.() || 0;
                  return timeB - timeA;
                })
                .slice(0, 20);

              sosAlerts.forEach((alert) => {
                if (alert.location && alert.location.latitude) {
                  history.push({
                    id: `sos-${alert.id}`,
                    address: 'SOS Alert Location',
                    latitude: alert.location.latitude,
                    longitude: alert.location.longitude,
                    timestamp: alert.timestamp,
                    accuracy: alert.location.accuracy || 'N/A',
                    icon: 'alert-circle',
                    source: 'sos',
                    severity: alert.severity,
                  });
                }
              });

              // Sort combined history
              history.sort((a, b) => {
                const timeA = a.timestamp?.toMillis?.() || 0;
                const timeB = b.timestamp?.toMillis?.() || 0;
                return timeB - timeA;
              });

              setLocationHistory(history);
            });
        },
        (error) => {
          console.error('Error listening to location history:', error);
        }
      );

    // Set up real-time listener for safe zones
    const unsubscribeSafeZones = firestore()
      .collection('patients')
      .doc(patientId)
      .collection('safeZones')
      .onSnapshot(
        (snapshot) => {
          const zones = [];
          snapshot.forEach((doc) => {
            const zone = doc.data();
            zones.push({
              id: doc.id,
              name: zone.name,
              latitude: zone.latitude,
              longitude: zone.longitude,
              radius: zone.radius,
              active: zone.active !== false,
            });
          });
          setSafeZones(zones);
        },
        (error) => {
          console.error('Error listening to safe zones:', error);
        }
      );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeLocation();
      unsubscribeHistory();
      unsubscribeSafeZones();
    };
  }, [patientId, patientName, navigation]);

  const loadLocationData = async () => {
    try {
      setLoading(true);
      
      // Helper to format relative time
      const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'recently';
        
        const now = new Date();
        const pastTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffMs = now - pastTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return 'a week ago';
      };

      // Fetch current location
      const latestLocation = await getLatestLocation(patientId);
      if (latestLocation) {
        setCurrentLocation({
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          address: latestLocation.address || 'Location detected',
          accuracy: latestLocation.accuracy || 10,
          timestamp: latestLocation.timestamp,
          status: 'active',
        });
      }

      // Fetch location history
      const historySnapshot = await firestore()
        .collection('gps_locations')
        .where('patientId', '==', patientId)
        .where('isDeleted', '==', false)
        .limit(20)
        .get();

      const history = [];
      historySnapshot.forEach((doc) => {
        const location = doc.data();
        history.push({
          id: doc.id,
          address: location.address || 'Unknown location',
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          duration: location.duration || 'N/A',
          icon: 'map-marker',
        });
      });

      // Sort by timestamp descending
      history.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setLocationHistory(history);

      // Fetch safe zones
      const zonesSnapshot = await firestore()
        .collection('safe_zones')
        .where('patientId', '==', patientId)
        .where('isDeleted', '==', false)
        .get();

      const zones = [];
      zonesSnapshot.forEach((doc) => {
        const zone = doc.data();
        zones.push({
          id: doc.id,
          name: zone.name,
          latitude: zone.latitude,
          longitude: zone.longitude,
          radius: zone.radius,
          active: zone.active !== false,
        });
      });

      setSafeZones(zones);
    } catch (error) {
      console.error('Error loading location:', error);
      Alert.alert('Error', 'Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocationData();
    setRefreshing(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'recently';
    
    const now = new Date();
    const pastTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - pastTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'a week ago';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Map View Section - Open in Google Maps */}
      {currentLocation && (
        <Card style={styles.mapCard}>
          <Card.Content>
            <View style={styles.mapInfoContainer}>
              <Icon name="map" size={48} color={colors.primary} />
              <View style={styles.mapTextContainer}>
                <Text style={[typography.heading3, { marginTop: spacing.md }]}>View on Map</Text>
                <Text style={styles.mapDescription}>
                  Open location in Google Maps for detailed navigation
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              icon="map-marker"
              onPress={() => {
                const url = `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
                Linking.openURL(url).catch(() => {
                  Alert.alert('Error', 'Could not open Google Maps');
                });
              }}
              style={styles.mapButton}
            >
              Open in Google Maps
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Current Location Section */}
      {currentLocation && (
        <Card style={styles.currentLocationCard}>
          <Card.Content>
            <View style={styles.locationHeader}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
              <Text style={typography.heading3}>Current Location</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.locationDetails}>
              <View style={styles.detailRow}>
                <Icon name="map-marker" size={20} color={colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{currentLocation.address}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Icon name="crosshairs-gps" size={20} color={colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Coordinates</Text>
                  <Text style={styles.detailValue}>
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Icon name="signal-cellular-3" size={20} color={colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Accuracy</Text>
                  <Text style={styles.detailValue}>±{currentLocation.accuracy}m</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Icon name="clock" size={20} color={colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Last Updated</Text>
                  <Text style={styles.detailValue}>
                    {currentLocation.timestamp && currentLocation.timestamp.toDate 
                      ? currentLocation.timestamp.toDate().toLocaleTimeString()
                      : currentLocation.timestamp?.toLocaleTimeString?.() || 'Unknown'
                    }
                  </Text>
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              icon="refresh"
              onPress={onRefresh}
              style={styles.refreshButton}
            >
              Refresh Location
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Location History Section */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle]}>Location History</Text>

        {locationHistory.length === 0 ? (
          <Text style={styles.emptyText}>No location history available</Text>
        ) : (
          locationHistory.map((location) => (
            <Card key={location.id} style={styles.historyCard}>
              <Card.Content>
                <View style={styles.historyRow}>
                  <View style={[styles.historyIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Icon name={location.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={typography.heading4}>{location.address}</Text>
                    <View style={styles.historyMeta}>
                      <Icon name="clock-outline" size={12} color={colors.gray} />
                      <Text style={styles.metaText}>{formatTime(location.timestamp)}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>{location.duration}</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      {/* Safe Zones Section */}
      <View style={styles.section}>
        <Text style={[typography.heading3, styles.sectionTitle]}>Safe Zones</Text>
        {safeZones.map((zone) => (
          <Card key={zone.id} style={styles.zoneCard}>
            <Card.Content>
              <View style={styles.zoneRow}>
                <Icon name="map-marker-check" size={24} color={colors.success} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={typography.heading4}>{zone.name}</Text>
                  <Text style={styles.zoneAddress}>Radius: {zone.radius}m</Text>
                </View>
                <Icon name="check-circle" size={20} color={colors.success} />
              </View>
            </Card.Content>
          </Card>
        ))}
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
  mapContainer: {
    height: 300,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  mapInfoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  mapTextContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  mapDescription: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  mapButton: {
    marginTop: spacing.md,
  },
  currentLocationCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  locationDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  refreshButton: {
    marginTop: spacing.md,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.text,
  },
  historyCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: spacing.xs,
  },
  metaDot: {
    color: colors.gray,
    marginHorizontal: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  zoneCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneAddress: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});

export default LocationScreen;
