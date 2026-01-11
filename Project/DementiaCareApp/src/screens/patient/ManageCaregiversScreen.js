/**
 * Manage Caregivers Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Allows patients to view, add, and manage their caregivers
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
import { useSettings } from '../../state/SettingsContext';
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

const ManageCaregiversScreen = ({ navigation }) => {
  // Call all hooks first, in consistent order
  const { getTextSize, settings } = useSettings();
  const [activeCaregiversList, setActiveCaregiversList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [addingCaregiver, setAddingCaregiver] = useState(false);
  
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activeCaregivers, pending] = await Promise.all([
        getActiveConnections(userId, 'patient'),
        getPendingRequests(userId, 'patient'),
      ]);
      setActiveCaregiversList(activeCaregivers);
      setPendingRequests(pending);
    } catch (error) {
      console.error('[ManageCaregiversScreen] Error loading data:', error);
      Alert.alert('Error', 'Failed to load caregivers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAddCaregiver = async () => {
    if (!caregiverEmail.trim()) {
      Alert.alert('Error', 'Please enter a caregiver email address');
      return;
    }

    setAddingCaregiver(true);
    try {
      // Find user by email
      const caregiver = await findUserByEmail(caregiverEmail.trim());

      if (!caregiver) {
        Alert.alert('Not Found', 'No user found with this email address');
        setAddingCaregiver(false);
        return;
      }

      if (caregiver.role !== 'caregiver') {
        Alert.alert('Error', 'This user is not registered as a caregiver');
        setAddingCaregiver(false);
        return;
      }

      if (caregiver.id === userId) {
        Alert.alert('Error', 'You cannot add yourself as a caregiver');
        setAddingCaregiver(false);
        return;
      }

      // Send connection request
      await sendConnectionRequest(userId, caregiver.id, 'patient', 'family');

      Alert.alert(
        'Request Sent',
        `Connection request sent to ${caregiver.fullName || caregiver.email}`,
        [{ text: 'OK', onPress: () => {
          setAddModalVisible(false);
          setCaregiverEmail('');
          loadData();
        }}]
      );
    } catch (error) {
      console.error('[ManageCaregiversScreen] Error adding caregiver:', error);
      
      let errorMessage = 'Failed to send connection request';
      if (error.message === 'ALREADY_CONNECTED') {
        errorMessage = 'You are already connected to this caregiver';
      } else if (error.message === 'REQUEST_PENDING') {
        errorMessage = 'A connection request is already pending with this caregiver';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingCaregiver(false);
    }
  };

  const handleAcceptRequest = async (relationshipId) => {
    try {
      await acceptConnectionRequest(relationshipId, userId);
      Alert.alert('Success', 'Connection request accepted');
      loadData();
    } catch (error) {
      console.error('[ManageCaregiversScreen] Error accepting request:', error);
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
              console.error('[ManageCaregiversScreen] Error rejecting request:', error);
              Alert.alert('Error', 'Failed to reject request');
            }
          },
        },
      ]
    );
  };

  const handleRevokeConnection = async (relationshipId, caregiverName) => {
    Alert.alert(
      'Remove Caregiver',
      `Are you sure you want to remove ${caregiverName} as your caregiver?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeConnection(relationshipId, userId, 'Removed by patient');
              Alert.alert('Removed', 'Caregiver connection removed');
              loadData();
            } catch (error) {
              console.error('[ManageCaregiversScreen] Error revoking connection:', error);
              Alert.alert('Error', 'Failed to remove caregiver');
            }
          },
        },
      ]
    );
  };

  const renderCaregiverCard = ({ item }) => (
    <Card style={[styles.card, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
      <Card.Content>
        <View style={styles.caregiverHeader}>
          <Avatar.Text
            size={50}
            label={item.otherUser.name.substring(0, 2).toUpperCase()}
            backgroundColor={settings.highContrast ? '#141313' : colors.primary}
          />
          <View style={styles.caregiverInfo}>
            <Text style={[typography.heading3, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>{item.otherUser.name}</Text>
            <Text style={[styles.email, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>{item.otherUser.email}</Text>
            {item.relationshipType && (
              <Text style={[styles.relationshipType, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>
                {item.relationshipType.charAt(0).toUpperCase() + item.relationshipType.slice(1)}
                {item.relationshipDetail ? ` - ${item.relationshipDetail}` : ''}
              </Text>
            )}
            {item.primaryCaregiver && (
              <Badge style={[styles.primaryBadge, { backgroundColor: colors.primary }, settings.highContrast && { backgroundColor: '#FFF' }]}>Primary Caregiver</Badge>
            )}
          </View>
          <IconButton
            icon="dots-vertical"
            size={24}
            iconColor={colors.text}
            onPress={() =>
              Alert.alert(
                'Options',
                `Manage ${item.otherUser.name}`,
                [
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
        <View style={styles.permissionsContainer}>
          <Text style={[styles.permissionsLabel, { fontSize: getTextSize(12), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Permissions:</Text>
          <View style={styles.permissionsList}>
            {item.permissions?.includes('view_location') && (
              <Badge style={[styles.permissionBadge, { fontSize: getTextSize(12), backgroundColor: colors.primary }, settings.highContrast && { backgroundColor: '#FFF', color: '#000' }]}>Location</Badge>
            )}
            {item.permissions?.includes('manage_reminders') && (
              <Badge style={[styles.permissionBadge, { fontSize: getTextSize(12), backgroundColor: colors.primary }, settings.highContrast && { backgroundColor: '#FFF', color: '#000' }]}>Reminders</Badge>
            )}
            {item.permissions?.includes('view_activities') && (
              <Badge style={[styles.permissionBadge, { fontSize: getTextSize(12), backgroundColor: colors.primary }, settings.highContrast && { backgroundColor: '#FFF', color: '#000' }]}>Activities</Badge>
            )}
            {item.permissions?.includes('receive_emergencies') && (
              <Badge style={[styles.permissionBadge, { fontSize: getTextSize(12), backgroundColor: colors.primary }, settings.highContrast && { backgroundColor: '#FFF', color: '#000' }]}>Emergency Alerts</Badge>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPendingRequest = ({ item }) => (
    <Card style={[styles.requestCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <Avatar.Text
            size={40}
            label={item.otherUser.name.substring(0, 2).toUpperCase()}
            backgroundColor={settings.highContrast ? '#FFF' : colors.warning}
          />
          <View style={styles.requestInfo}>
            <Text style={[typography.body, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>{item.otherUser.name}</Text>
            <Text style={[styles.requestEmail, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>{item.otherUser.email}</Text>
            <Text style={[styles.requestNote, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>
              {item.linkedBy === userId ? 'Request sent' : 'Wants to be your caregiver'}
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
    <View style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, settings.highContrast && { borderBottomWidth: 2, borderBottomColor: '#FFF', paddingBottom: spacing.md }]}>
        <Text style={[typography.heading1, { fontSize: getTextSize(24) }, settings.highContrast && { color: '#FFF' }]}>My Caregivers</Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          Add Caregiver
        </Button>
      </View>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[typography.heading2, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Pending Requests</Text>
            <Badge style={[styles.countBadge, settings.highContrast && { backgroundColor: '#FFF' }]}>
              <Text style={[settings.highContrast && { color: '#000' }]}>{pendingRequests.length}</Text>
            </Badge>
          </View>
          <FlatList
            data={pendingRequests}
            renderItem={renderPendingRequest}
            keyExtractor={(item) => item.id}
            style={styles.requestsList}
          />
          <Divider style={styles.divider} />
        </>
      )}

      {/* Active Caregivers Section */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.heading2, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Active Caregivers</Text>
        {activeCaregiversList.length > 0 && (
          <Badge style={[styles.countBadge, settings.highContrast && { backgroundColor: '#FFF' }]}>
            <Text style={[settings.highContrast && { color: '#000' }]}>{activeCaregiversList.length}</Text>
          </Badge>
        )}
      </View>

      <FlatList
        data={activeCaregiversList}
        renderItem={renderCaregiverCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>No active caregivers</Text>
            <Text style={[styles.emptySubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
              Add a caregiver to help monitor your activities and receive emergency alerts
            </Text>
          </View>
        }
      />

      {/* Add Caregiver Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={[styles.modalOverlay, settings.highContrast && { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={[styles.modalContent, settings.highContrast && { backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' }]}>
            <Text style={[typography.heading2, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Add Caregiver</Text>
            <Text style={[styles.modalDescription, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
              Enter the email address of the person you want to add as your caregiver
            </Text>

            <TextInput
              style={[styles.input, settings.highContrast && { backgroundColor: '#1a1a1a', borderColor: '#FFF', borderWidth: 2, color: '#FFF' }]}
              placeholder="caregiver@example.com"
              placeholderTextColor={settings.highContrast ? '#999' : colors.textSecondary}
              value={caregiverEmail}
              onChangeText={setCaregiverEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setAddModalVisible(false);
                  setCaregiverEmail('');
                }}
                style={styles.modalButton}
                disabled={addingCaregiver}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddCaregiver}
                style={styles.modalButton}
                loading={addingCaregiver}
                disabled={addingCaregiver}
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
  caregiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  caregiverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  relationshipType: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
  primaryBadge: {
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  permissionsContainer: {
    marginTop: spacing.sm,
  },
  permissionsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  permissionBadge: {
    backgroundColor: colors.surface,
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
  divider: {
    marginVertical: spacing.md,
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

export default ManageCaregiversScreen;
