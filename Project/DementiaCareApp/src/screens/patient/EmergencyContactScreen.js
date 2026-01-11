/**
 * Emergency Contact Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Manage emergency contacts for quick access
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import { Card, Text, Button, FAB, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { saveEmergencyContacts, getEmergencyContacts } from '../../services/firestoreService';
import auth from '@react-native-firebase/auth';

const RELATION_OPTIONS = ['Caregiver', 'Family', 'Friend', 'Doctor', 'Nurse', 'Other'];

const EmergencyContactScreen = ({ navigation }) => {
  const { getTextSize, settings } = useSettings();
  const currentUser = auth().currentUser;
  const patientId = currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Primary Caregiver',
      phone: '+1 (555) 123-4567',
      relation: 'Caregiver',
    },
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: '',
  });

  // Load contacts from Firestore on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (patientId) {
          const firestoreContacts = await getEmergencyContacts(patientId);
          setContacts(firestoreContacts);
        }
      } catch (error) {
        console.error('[EmergencyContactScreen] Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [patientId]);

  const saveContactsToFirestore = async (updatedContacts) => {
    try {
      if (patientId) {
        await saveEmergencyContacts(patientId, updatedContacts);
      }
    } catch (error) {
      console.error('[EmergencyContactScreen] Error saving contacts:', error);
      Alert.alert('Error', 'Failed to save contacts');
    }
  };

  const handleCallContact = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber.replace(/\s/g, '').replace(/[^\d+]/g, '')}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Error', 'Unable to call this number');
    });
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const contact = {
      id: Date.now().toString(),
      ...newContact,
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    setNewContact({ name: '', phone: '', relation: '' });
    setShowAddContact(false);
    
    // Save to Firestore
    await saveContactsToFirestore(updatedContacts);
    Alert.alert('Success', 'Contact added successfully');
  };

  const handleDeleteContact = (id) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedContacts = contacts.filter(c => c.id !== id);
            setContacts(updatedContacts);
            await saveContactsToFirestore(updatedContacts);
            Alert.alert('Success', 'Contact deleted');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, settings.highContrast && { backgroundColor: '#000', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
          <Text style={[typography.heading3, styles.headerTitle, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>
            Emergency Contacts
          </Text>
          <Text style={[styles.headerSubtext, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
            These contacts will be notified in case of emergency
          </Text>
        </View>

        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Card key={contact.id} style={[styles.contactCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
              <Card.Content>
                <View style={styles.contactHeader}>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>{contact.name}</Text>
                    <Text style={[styles.contactRelation, { fontSize: getTextSize(12) }, settings.highContrast && { color: '#FFF' }]}>{contact.relation}</Text>
                  </View>
                  <Icon name="phone" size={24} color={settings.highContrast ? '#FFF' : colors.primary} />
                </View>
                <Text style={[styles.phoneNumber, { fontSize: getTextSize(16) }, settings.highContrast && { color: '#FFF' }]}>{contact.phone}</Text>
                <View style={styles.contactActions}>
                  <Button
                    mode="text"
                    icon="phone-outgoing"
                    textColor={colors.success}
                    compact
                    onPress={() => handleCallContact(contact.phone)}
                  >
                    Call
                  </Button>
                  <Button
                    mode="text"
                    icon="trash-can"
                    textColor={colors.error}
                    compact
                    onPress={() => handleDeleteContact(contact.id)}
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={[styles.emptyCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="phone-alert" size={64} color={settings.highContrast ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.emptyText, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>No emergency contacts</Text>
                <Text style={[styles.emptySubtext, { fontSize: getTextSize(14), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>Add your first emergency contact</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {showAddContact && (
          <Card style={[styles.addContactCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
            <Card.Content>
              <Text style={[typography.heading3, { marginBottom: spacing.md, fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
                Add New Contact
              </Text>

              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.lightGray }, settings.highContrast && { backgroundColor: '#000', borderColor: '#FFF', borderWidth: 2, color: '#FFF' }]}
                placeholder="Contact Name"
                placeholderTextColor={settings.highContrast ? '#999' : colors.textSecondary}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />

              <TextInput
                style={[styles.input, settings.highContrast && { backgroundColor: '#000', borderColor: '#FFF', borderWidth: 2, color: '#FFF' }]}
                placeholder="Phone Number"
                placeholderTextColor={settings.highContrast ? '#999' : colors.gray}
                keyboardType="phone-pad"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
              />

              <Pressable
                style={[styles.dropdownButton, settings.highContrast && { backgroundColor: '#000', borderColor: '#FFF', borderWidth: 2 }]}
                onPress={() => setShowRelationPicker(true)}
              >
                <Icon name="account-circle" size={20} color={settings.highContrast ? '#FFF' : colors.primary} style={styles.dropdownIcon} />
                <Text style={[styles.dropdownButtonText, { fontSize: getTextSize(16) }, settings.highContrast && { color: '#FFF' }]}>
                  {newContact.relation || 'Select Relation'}
                </Text>
                <Icon name="chevron-down" size={20} color={settings.highContrast ? '#FFF' : colors.gray} />
              </Pressable>

              <View style={styles.buttonGroup}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddContact(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddContact}
                  style={styles.button}
                >
                  Add
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Relation Picker Modal */}
      <Modal
        visible={showRelationPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRelationPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContainer, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
            <View style={[styles.pickerHeader, settings.highContrast && { borderBottomColor: '#FFF', backgroundColor: '#000' }]}>
              <Text style={[styles.pickerTitle, { fontSize: getTextSize(18) }, settings.highContrast && { color: '#FFF' }]}>Select Relation</Text>
              <Pressable onPress={() => setShowRelationPicker(false)}>
                <Icon name="close" size={24} color={settings.highContrast ? '#FFF' : colors.primary} />
              </Pressable>
            </View>
            <FlatList
              data={RELATION_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.pickerItem,
                    newContact.relation === item && styles.pickerItemSelected,
                    settings.highContrast && { backgroundColor: newContact.relation === item ? '#FFF' : '#000', borderBottomColor: '#FFF' }
                  ]}
                  onPress={() => {
                    setNewContact({ ...newContact, relation: item });
                    setShowRelationPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { fontSize: getTextSize(16) },
                      newContact.relation === item && styles.pickerItemTextSelected,
                      settings.highContrast && { color: newContact.relation === item ? '#000' : '#FFF' }
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
            <View style={[styles.pickerFooter, settings.highContrast && { backgroundColor: '#000' }]}>
              <Button
                mode="contained"
                onPress={() => setShowRelationPicker(false)}
                style={styles.pickerButton}
              >
                Done
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {!showAddContact && (
        <FAB
          icon="plus"
          label="Add Contact"
          style={styles.fab}
          onPress={() => setShowAddContact(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  headerTitle: {
    color: colors.white,
    marginBottom: spacing.sm,
  },
  headerSubtext: {
    color: colors.white,
    fontSize: 14,
  },
  contactCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  contactRelation: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  phoneNumber: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: spacing.md,
  },
  emptyCard: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  addContactCard: {
    margin: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownIcon: {
    marginRight: spacing.sm,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  pickerItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  pickerFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  pickerButton: {
    marginBottom: 0,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default EmergencyContactScreen;
