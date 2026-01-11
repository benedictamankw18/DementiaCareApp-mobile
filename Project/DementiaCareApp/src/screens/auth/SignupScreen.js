/**
 * Signup Screen
 * Dementia Care Mobile Application
 * 
 * Allows new users to create an account as Patient or Caregiver
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, TextInput, Text, RadioButton } from 'react-native-paper';
import { signUp } from '../../services/authService';
import { colors, typography, spacing } from '../../styles/theme';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'caregiver'
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, fullName, role);

    if (result.success) {
      Alert.alert('Success', 'Account created successfully!');
      // Navigate to login or directly authenticate
      navigation.navigate('Login');
    } else {
      Alert.alert('Signup Failed', result.error);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Full Name Input */}
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            mode="outlined"
            editable={!loading}
            autoCapitalize="words"
          />

          {/* Email Input */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            editable={!loading}
          />

          {/* Password Input */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            editable={!loading}
          />

          {/* Confirm Password Input */}
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            editable={!loading}
          />

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            
            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => setRole('patient')}
              disabled={loading}
            >
              <RadioButton
                value="patient"
                status={role === 'patient' ? 'checked' : 'unchecked'}
                onPress={() => setRole('patient')}
                disabled={loading}
              />
              <Text style={styles.roleText}>Person with Dementia (Patient)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => setRole('caregiver')}
              disabled={loading}
            >
              <RadioButton
                value="caregiver"
                status={role === 'caregiver' ? 'checked' : 'unchecked'}
                onPress={() => setRole('caregiver')}
                disabled={loading}
              />
              <Text style={styles.roleText}>Caregiver/Family Member</Text>
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
            labelStyle={styles.buttonLabel}
          >
            Create Account
          </Button>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Button
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              Sign In
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: spacing.lg,
    fontSize: typography.body,
  },
  roleContainer: {
    marginVertical: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.md,
  },
  roleLabel: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  roleText: {
    fontSize: typography.body,
    marginLeft: spacing.sm,
    color: colors.textPrimary,
  },
  signupButton: {
    paddingVertical: spacing.sm,
    marginVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  loginText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});

export default SignupScreen;
