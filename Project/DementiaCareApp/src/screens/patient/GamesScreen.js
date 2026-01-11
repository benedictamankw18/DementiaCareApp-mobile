/**
 * Games Screen (Patient)
 * Dementia Care Mobile Application
 * 
 * Memory games and cognitive exercises for patients
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { getAllGames, getPlayerStats, getDailyChallenge, listenToPlayerStats, listenToDailyChallenge } from '../../services/gamesService';
import auth from '@react-native-firebase/auth';

const GamesScreen = ({ navigation }) => {
  const { getTextSize, settings } = useSettings();
  const [games, setGames] = useState(getAllGames());
  const [stats, setStats] = useState(getPlayerStats());
  const [dailyChallenge, setDailyChallenge] = useState(getDailyChallenge());

  // Use focus effect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGameData();
    }, [])
  );

  // Set up real-time stats listener when component mounts
  useEffect(() => {
    const user = auth().currentUser;
    if (!user?.uid) {
      console.log('[GamesScreen] No authenticated user');
      return;
    }

    // Subscribe to real-time stats updates
    const unsubscribeStats = listenToPlayerStats(user.uid, (updatedStats) => {
      setStats(updatedStats);
    });

    // Subscribe to real-time daily challenge updates
    const unsubscribeChallenge = listenToDailyChallenge(user.uid, (updatedChallenge) => {
      setDailyChallenge(updatedChallenge);
    });

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeStats) {
        unsubscribeStats();
      }
      if (unsubscribeChallenge) {
        unsubscribeChallenge();
      }
    };
  }, []);

  const loadGameData = () => {
    try {
      const loadedGames = getAllGames();
      const loadedChallenge = getDailyChallenge();

      setGames(loadedGames);
      setDailyChallenge(loadedChallenge);
      console.log('[GamesScreen] Game data loaded successfully');
    } catch (error) {
      console.error('[GamesScreen] Error loading game data:', error);
    }
  };

  const handlePlayGame = (gameId, difficulty = 'easy') => {
    if (gameId === 1) {
      // Memory Match Game
      navigation.navigate('MemoryMatchGame', { difficulty });
    } else if (gameId === 2) {
      // Word Puzzle Game
      navigation.navigate('WordPuzzleGame', { difficulty });
    } else if (gameId === 3) {
      // Picture Recognition Game
      navigation.navigate('PictureRecognitionGame', { difficulty });
    } else if (gameId === 4) {
      // Number Sequence Game
      navigation.navigate('NumberSequenceGame', { difficulty });
    } else if (gameId === 5) {
      // Color Match Game
      navigation.navigate('ColorMatchGame', { difficulty });
    } else if (gameId === 6) {
      // Story Builder Game
      navigation.navigate('StoryBuilderGame', { difficulty });
    } else {
      // Placeholder for other games
      console.log('[GamesScreen] Game', gameId, 'not yet implemented');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return colors.success;
      case 'Medium':
        return colors.warning;
      case 'Hard':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Stats Card */}
      <Card style={[styles.statsCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="gamepad-variant" size={32} color={settings.highContrast ? '#FFF' : colors.primary} />
              <Text style={[styles.statNumber, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>{stats.totalGames}</Text>
              <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>Games Played</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fire" size={32} color={settings.highContrast ? '#FFF' : colors.warning} />
              <Text style={[styles.statNumber, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>{stats.streak}</Text>
              <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={32} color={settings.highContrast ? '#FFF' : colors.success} />
              <Text style={[styles.statNumber, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>{stats.achievements}</Text>
              <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>Achievements</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Daily Challenge */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Daily Challenge</Text>
        {dailyChallenge && (
          <Card style={[styles.challengeCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <Icon name={dailyChallenge.icon} size={40} color={settings.highContrast ? '#FFF' : colors.warning} />
                <View style={styles.challengeInfo}>
                  <Text style={[styles.challengeTitle, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>{dailyChallenge.title}</Text>
                  <Text style={[styles.challengeDescription, { fontSize: getTextSize(14), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>
                    {dailyChallenge.description}
                  </Text>
                </View>
              </View>
              <View style={styles.challengeProgress}>
                <View style={[styles.progressBar, { backgroundColor: colors.lightGray }, settings.highContrast && { backgroundColor: '#333' }]}>
                  <View style={[styles.progressFill, { width: `${(dailyChallenge.completed / dailyChallenge.target) * 100}%`, backgroundColor: colors.success }]} />
                </View>
                <Text style={[styles.progressText, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>{dailyChallenge.completed}/{dailyChallenge.target} Complete</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Games Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>Available Games</Text>
        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}
              onPress={() => {}}
            >
              <View style={[styles.gameIconContainer, { backgroundColor: (settings.highContrast ? '#FFF' : game.color) + (settings.highContrast ? '' : '20') }]}>
                <Icon name={game.icon} size={48} color={settings.highContrast ? '#000' : game.color} />
              </View>
              <Text style={[styles.gameTitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>{game.title}</Text>
              <Text style={[styles.gameDescription, { fontSize: getTextSize(12), color: colors.textSecondary }, settings.highContrast && { color: '#FFF' }]}>{game.description}</Text>
              <View style={styles.gameFooter}>
                <Chip
                  style={[
                    styles.difficultyChip,
                    { backgroundColor: (settings.highContrast ? '#FFF' : getDifficultyColor(game.difficulty)) + (settings.highContrast ? '' : '20') }
                  ]}
                  textStyle={[
                    styles.chipText,
                    { color: settings.highContrast ? '#000' : getDifficultyColor(game.difficulty), fontSize: getTextSize(10) }
                  ]}
                >
                  {game.difficulty}
                </Chip>
                <View style={styles.durationContainer}>
                  <Icon name="clock-outline" size={14} color={settings.highContrast ? '#FFF' : colors.gray} />
                  <Text style={[styles.durationText, { fontSize: getTextSize(11) }, settings.highContrast && { color: '#FFF' }]}>{game.duration}</Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => handlePlayGame(game.id, 'easy')}
                style={[styles.playButton, { backgroundColor: settings.highContrast ? '#FFF' : game.color }]}
                labelStyle={[styles.playButtonLabel, { color: settings.highContrast ? '#000' : colors.white }]}
              >
                Play
              </Button>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Coming Soon */}
      <View style={styles.section}>
        <Card style={[styles.comingSoonCard, settings.highContrast && { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#FFF' }]}>
          <Card.Content>
            <View style={styles.comingSoonContent}>
              <Icon name="rocket-launch" size={64} color={settings.highContrast ? '#FFF' : colors.primary} />
              <Text style={[styles.comingSoonTitle, { fontSize: getTextSize(20) }, settings.highContrast && { color: '#FFF' }]}>More Games Coming Soon!</Text>
              <Text style={[styles.comingSoonText, { fontSize: getTextSize(14) }, settings.highContrast && { color: '#FFF' }]}>
                We're working on adding more fun and engaging cognitive exercises
              </Text>
            </View>
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
  statsCard: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  challengeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    marginBottom: spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  challengeProgress: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
  },
  gameIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: spacing.md,
    textAlign: 'center',
    minHeight: 36,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  difficultyChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 11,
    color: colors.gray,
    marginLeft: 4,
  },
  playButton: {
    marginTop: spacing.sm,
  },
  playButtonLabel: {
    color: colors.white,
    fontSize: 14,
  },
  comingSoonCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 1,
  },
  comingSoonContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default GamesScreen;
