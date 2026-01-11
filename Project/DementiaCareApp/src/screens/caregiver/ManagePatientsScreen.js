/**
 * Manage Patients Screen (Caregiver)
 * Dementia Care Mobile Application
 * 
 * Allows caregivers to view, add, and manage their patients
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Card, Avatar, Button, Divider, Badge, IconButton } from 'react-native-paper';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import {
  getActiveConnections,
  getPendingRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  revokeConnection,
  findUserByEmail,
} from '../../services/linkingService';
import auth from '@react-native-firebase/auth';

const ManagePatientsScreen = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const [activePatientsList, setActivePatientsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [addingPatient, setAddingPatient] = useState(false);

  const userId = auth().currentUser?.uid;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activePatients, pending] = await Promise.all([
        getActiveConnections(userId, 'caregiver'),
        getPendingRequests(userId, 'caregiver'),
      ]);
      setActivePatientsList(activePatients);
      setPendingRequests(pending);
    } catch (error) {
      console.error('[ManagePatientsScreen] Error loading data:', error);
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAddPatient = async () => {
    if (!patientEmail.trim()) {
      Alert.alert('Error', 'Please enter a patient email address');
      return;
    }

    setAddingPatient(true);
    try {
      // Find user by email
      const patient = await findUserByEmail(patientEmail.trim());

      if (!patient) {
        Alert.alert('Not Found', 'No user found with this email address');
        setAddingPatient(false);
        return;
      }

      if (patient.role !== 'patient') {
        Alert.alert('Error', 'This user is not registered as a patient');
        setAddingPatient(false);
        return;
      }

      if (patient.id === userId) {
        Alert.alert('Error', 'You cannot add yourself as a patient');
        setAddingPatient(false);
        return;
      }

      // Send connection request
      await sendConnectionRequest(userId, patient.id, 'caregiver', 'professional');

      Alert.alert(
        'Request Sent',
        `Connection request sent to ${patient.fullName || patient.email}`,
        [{ text: 'OK', onPress: () => {
          setAddModalVisible(false);
          setPatientEmail('');
          loadData();
        }}]
      );
    } catch (error) {
      console.error('[ManagePatientsScreen] Error adding patient:', error);
      
      let errorMessage = 'Failed to send connection request';
      if (error.message === 'ALREADY_CONNECTED') {
        errorMessage = 'You are already connected to this patient';
      } else if (error.message === 'REQUEST_PENDING') {
        errorMessage = 'A connection request is already pending with this patient';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingPatient(false);
    }
  };

  const handleAcceptRequest = async (relationshipId) => {
    try {
      await acceptConnectionRequest(relationshipId, userId);
      Alert.alert('Success', 'Connection request accepted');
      loadData();
    } catch (error) {
      console.error('[ManagePatientsScreen] Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (relationshipId) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this connection request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectConnectionRequest(relationshipId, userId);
              Alert.alert('Rejected', 'Connection request rejected');
              loadData();
            } catch (error) {
              console.error('[ManagePatientsScreen] Error rejecting request:', error);
              Alert.alert('Error', 'Failed to reject request');
            }
          },
        },
      ]
    );
  };

  const handleRevokeConnection = async (relationshipId, patientName) => {
    Alert.alert(
      'Remove Patient',
      `Are you sure you want to stop caring for ${patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeConnection(relationshipId, userId, 'Removed by caregiver');
              Alert.alert('Removed', 'Patient connection removed');
              loadData();
            } catch (error) {
              console.error('[ManagePatientsScreen] Error revoking connection:', error);
              Alert.alert('Error', 'Failed to remove patient');
            }
          },
        },
      ]
    );
  };

  const handleViewPatient = (patient) => {
    navigation.navigate('PatientActivity', {
      patientId: patient.otherUser.id,
      patientName: patient.otherUser.name,
    });
  };

  const renderPatientCard = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
      <TouchableOpacity onPress={() => handleViewPatient(item)}>
        <Card.Content>
          <View style={styles.patientHeader}>
            <Avatar.Text
              size={50}
              label={item.otherUser.name.substring(0, 2).toUpperCase()}
              backgroundColor={themeColors.primary}
            />
            <View style={styles.patientInfo}>
              <Text style={[typography.heading3, { color: themeColors.text }]}>{item.otherUser.name}</Text>
              <Text style={[styles.email, { color: themeColors.textSecondary }]}>{item.otherUser.email}</Text>
              {item.otherUser.phoneNumber && (
                <Text style={[styles.phone, { color: themeColors.textSecondary }]}>{item.otherUser.phoneNumber}</Text>
              )}
              {item.relationshipType && (
                <Text style={styles.relationshipType}>
                  {item.relationshipType.charAt(0).toUpperCase() + item.relationshipType.slice(1)}
                  {item.relationshipDetail ? ` - ${item.relationshipDetail}` : ''}
                </Text>
              )}
            </View>
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() =>
                Alert.alert(
                  'Options',
                  `Manage ${item.otherUser.name}`,
                  [
                    {
                      text: 'View Activity',
                      onPress: () => handleViewPatient(item),
                    },
                    {
                      text: 'View Location',
                      onPress: () =>
                        navigation.navigate('Location', {
                          patientId: item.otherUser.id,
                          patientName: item.otherUser.name,
                        }),
                    },
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => handleRevokeConnection(item.id, item.otherUser.name),
                    },
                  ]
                )
              }
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.actionsRow}>
            <Button
              mode="outlined"
              icon="chart-timeline-variant"
              onPress={() => handleViewPatient(item)}
              style={styles.actionButton}
              compact
            >
              Activity
            </Button>
            <Button
              mode="outlined"
              icon="map-marker"
              onPress={() =>
                navigation.navigate('Location', {
                  patientId: item.otherUser.id,
                  patientName: item.otherUser.name,
                })
              }
              style={styles.actionButton}
              compact
            >
              Location
            </Button>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderPendingRequest = ({ item }) => (
    <Card style={[styles.requestCard, { backgroundColor: themeColors.surface }]}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <Avatar.Text
            size={40}
            label={item.otherUser.name.substring(0, 2).toUpperCase()}
            backgroundColor={themeColors.warning}
          />
          <View style={styles.requestInfo}>
            <Text style={[typography.body, { color: themeColors.text }]}>{item.otherUser.name}</Text>
            <Text style={[styles.requestEmail, { color: themeColors.textSecondary }]}>{item.otherUser.email}</Text>
            <Text style={[styles.requestNote, { color: themeColors.textSecondary }]}>
              {item.linkedBy === userId ? 'Request sent' : 'Wants you as their caregiver'}
            </Text>
          </View>
        </View>
        {item.linkedBy !== userId && (
          <View style={styles.requestActions}>
            <Button
              mode="contained"
              onPress={() => handleAcceptRequest(item.id)}
              style={styles.acceptButton}
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleRejectRequest(item.id)}
              style={styles.rejectButton}
            >
              Reject
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={[typography.heading1, { color: themeColors.white }]}>My Patients</Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          Add Patient
        </Button>
      </View>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <>
          <View style={[styles.sectionHeader, { backgroundColor: themeColors.background }]}>
            <Text style={[typography.heading2, { color: themeColors.text }]}>Pending Requests</Text>
            <Badge style={[styles.countBadge, { backgroundColor: themeColors.primary }]}>{pendingRequests.length}</Badge>
          </View>
          <FlatList
            data={pendingRequests}
            renderItem={renderPendingRequest}
            keyExtractor={(item) => item.id}
            style={[styles.requestsList, { backgroundColor: themeColors.background }]}
          />
          <Divider style={[styles.divider, { backgroundColor: themeColors.lightGray }]} />
        </>
      )}

      {/* Active Patients Section */}
      <View style={[styles.sectionHeader, { backgroundColor: themeColors.background }]}>
        <Text style={[typography.heading2, { color: themeColors.text }]}>Active Patients</Text>
        {activePatientsList.length > 0 && (
          <Badge style={[styles.countBadge, { backgroundColor: themeColors.primary }]}>{activePatientsList.length}</Badge>
        )}
      </View>

      <FlatList
        data={activePatientsList}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No active patients</Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
              Add patients to monitor their activities and provide care support
            </Text>
          </View>
        }
        scrollEnabled={false}
      />

      {/* Add Patient Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <Text style={[typography.heading2, { color: themeColors.text }]}>Add Patient</Text>
            <Text style={[styles.modalDescription, { color: themeColors.textSecondary }]}>
              Enter the email address of the patient you want to care for
            </Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.background, 
                color: themeColors.text,
                borderColor: themeColors.lightGray
              }]}
              placeholder="patient@example.com"
              placeholderTextColor={themeColors.textSecondary}
              value={patientEmail}
              onChangeText={setPatientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setAddModalVisible(false);
                  setPatientEmail('');
                }}
                style={styles.modalButton}
                disabled={addingPatient}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddPatient}
                style={styles.modalButton}
                loading={addingPatient}
                disabled={addingPatient}
              >
                Send Request
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.primary,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  patientInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  relationshipType: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  requestCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: colors.warning + '15',
  },
  requestsList: {
    maxHeight: 200,
    marginBottom: spacing.sm,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  requestNote: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
  },
  rejectButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.heading3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginVertical: spacing.md,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default ManagePatientsScreen;
