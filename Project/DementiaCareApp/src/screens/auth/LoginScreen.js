/**
 * Login Screen
 * Dementia Care Mobile Application
 * 
 * Allows users (Patient or Caregiver) to log in with email and password
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { logIn } from '../../services/authService';
import { colors, typography, spacing } from '../../styles/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await logIn(email, password);

    if (result.success) {
      // Navigation will be handled by Auth Stack based on user role
      console.log('Login successful:', result.user);
    } else {
      Alert.alert('Login Failed', result.error);
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
          <Text style={styles.title}>Dementia Care</Text>
          <Text style={styles.subtitle}>Sign In</Text>
        </View>

        <View style={styles.formContainer}>
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

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            editable={!loading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            labelStyle={styles.buttonLabel}
          >
            Sign In
          </Button>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Button
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
            >
              Sign Up
            </Button>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            For testing, use the credentials created in Firebase Console
          </Text>
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
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.h3,
    color: colors.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: spacing.lg,
    fontSize: typography.body,
  },
  loginButton: {
    paddingVertical: spacing.sm,
    marginVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  signupText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  infoContainer: {
    backgroundColor: colors.lightGray,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.xl,
  },
  infoText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoginScreen;
