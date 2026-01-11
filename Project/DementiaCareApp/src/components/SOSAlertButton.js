/**
 * SOS Alert Button Component
 * Dementia Care Mobile Application
 * 
 * Emergency button for patients to trigger SOS alerts
 */

import React, { useState } from 'react';
import { View, StyleSheet, Modal, Alert } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { triggerSOSAlert } from '../../services/sosAlertService';

const SOSAlertButton = ({ patientId, patientName, onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSOSPress = () => {
    // Show confirmation first
    setShowConfirmation(true);
  };

  const handleConfirmSOS = async () => {
    setShowConfirmation(false);
    setShowModal(true);
  };

  const handleCancelSOS = () => {
    setShowConfirmation(false);
    setReason('');
  };

  const handleSubmitSOS = async () => {
    try {
      setLoading(true);

      if (!patientId) {
        Alert.alert('Error', 'Patient ID not available');
        return;
      }

      // Trigger SOS alert
      const success = await triggerSOSAlert(
        patientId,
        patientName || 'Patient',
        null,
        reason || 'Emergency'
      );

      if (success) {
        Alert.alert(
          'SOS Alert Sent',
          'Your caregivers have been notified and will respond shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowModal(false);
                setReason('');
                if (onSuccess) {
                  onSuccess();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to send SOS alert. Please try again.');
      }
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      Alert.alert('Error', 'An error occurred while sending the SOS alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SOS Alert Button */}
      <View style={styles.container}>
        <Button
          mode="contained"
          icon="alert-circle"
          onPress={handleSOSPress}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        >
          SOS Emergency
        </Button>
        <Text style={styles.subtitle}>Long press for emergency help</Text>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
      >
        <View style={styles.centeredView}>
          <View style={styles.confirmationModal}>
            <Icon
              name="alert-circle"
              size={60}
              color={colors.error}
              style={styles.confirmationIcon}
            />

            <Text style={[typography.heading3, styles.confirmationTitle]}>
              Send SOS Alert?
            </Text>

            <Text style={styles.confirmationMessage}>
              This will immediately notify your caregivers of your emergency. Are you sure?
            </Text>

            <View style={styles.confirmationButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelSOS}
                style={styles.cancelButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleConfirmSOS}
                icon="check"
                style={styles.confirmButton}
              >
                Yes, Send Alert
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
      >
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Icon name="alert" size={32} color={colors.error} />
              <Text style={[typography.heading2, { marginLeft: spacing.md }]}>
                SOS Alert Details
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.modalContent}>
              <Text style={styles.label}>What is the emergency?</Text>
              <TextInput
                placeholder="Describe the emergency (optional)"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                style={styles.input}
                editable={!loading}
              />

              <Text style={styles.warningText}>
                ⚠️ Your caregivers will be notified immediately with your location and emergency details.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowModal(false);
                  setReason('');
                }}
                style={styles.buttonFlexible}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                icon={loading ? undefined : 'check'}
                onPress={handleSubmitSOS}
                style={[styles.buttonFlexible, { backgroundColor: colors.error }]}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={colors.white} /> : 'Send SOS Alert'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmationModal: {
    width: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  confirmationIcon: {
    marginBottom: spacing.md,
  },
  confirmationTitle: {
    color: colors.text,
    marginBottom: spacing.md,
  },
  confirmationMessage: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.gray,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.error,
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  divider: {
    height: 1,
  },
  modalContent: {
    padding: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  buttonFlexible: {
    flex: 1,
  },
});

export default SOSAlertButton;
