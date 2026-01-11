/**
 * Privacy Policy Screen
 * Dementia Care Mobile Application
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors, typography, spacing } from '../../styles/theme';
import { useTheme } from '../../state/ThemeContext';
import { t } from '../../services/i18nService';

const PrivacyPolicyScreen = () => {
  const { colors: themeColors } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <Text style={[typography.heading3, styles.title, { color: themeColors.text }]}>
              {t('privacy.title')}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('privacy.intro')}</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.section1')}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('privacy.collection')}</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.section2')}
            </Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.typesOfData')}
              {'\n'} • {t('privacy.personalInfo')}
              {'\n'} • {t('privacy.usageData')}
              {'\n'} • {t('privacy.locationData')}
              {'\n'} • {t('privacy.healthInfo')}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('privacy.useOfData')}</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.section3')}
              {'\n'} • {t('privacy.provideService')}
              {'\n'} • {t('privacy.notifyChanges')}
              {'\n'} • {t('privacy.interactiveFeatures')}
              {'\n'} • {t('privacy.customerSupport')}
              {'\n'} • {t('privacy.analysis')}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('privacy.security')}</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.section4')}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('privacy.changes')}</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.section5')}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('privacy.contact')}</Text>
            <Text style={[styles.text, { color: themeColors.text }]}>
              {t('privacy.section6')}
            </Text>

            <Text style={[styles.lastUpdated, { color: themeColors.textSecondary }]}>
              {t('privacy.lastUpdated')}
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
  lastUpdated: {
    fontSize: 11,
    color: colors.gray,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;
