/**
 * Terms of Service Screen
 * Dementia Care Mobile Application
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';

const TermsOfServiceScreen = () => {
  const { colors: themeColors } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <Text style={[typography.heading3, styles.title, { color: themeColors.text }]}>
              Terms of Service
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>1. Acceptance of Terms</Text>
            <Text style={styles.text}>
              By downloading and using the Dementia Care Application, you agree to comply with and be bound by these terms and conditions.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>2. Use License</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              Permission is granted to temporarily download one copy of the materials (information or software) on the Dementia Care Application for personal, non-commercial transitory viewing only.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>3. Disclaimer</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              The materials on Dementia Care Application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>4. Limitations</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              In no event shall the Dementia Care Application or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Dementia Care Application.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>5. Accuracy of Materials</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              The materials appearing on the Dementia Care Application could include technical, typographical, or photographic errors. The Dementia Care Application does not warrant that any of the materials on its website are accurate, complete, or current.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>6. Links</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              The Dementia Care Application has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by the Dementia Care Application of the site. Use of any such linked website is at the user's own risk.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>7. Modifications</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              The Dementia Care Application may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>8. Governing Law</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the service is provided, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  title: {
    marginBottom: spacing.lg,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});

export default TermsOfServiceScreen;
