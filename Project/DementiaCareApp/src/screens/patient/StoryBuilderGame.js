/**
 * Story Builder Game Screen
 * Dementia Care Mobile Application
 * 
 * Creative storytelling game for cognitive and creative exercise
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { logGameSession } from '../../services/gamesService';
import auth from '@react-native-firebase/auth';

// Story prompts and scenarios for different difficulty levels
const STORY_SETS = {
  easy: {
    prompts: [
      { id: 1, title: 'A Sunny Day', prompt: 'Write a short story about a beautiful sunny day. What happens?' },
      { id: 2, title: 'The Garden', prompt: 'Describe a visit to a beautiful garden. What do you see?' },
      { id: 3, title: 'A Kind Neighbor', prompt: 'Tell a story about a kind neighbor helping someone.' },
      { id: 4, title: 'Birthday Surprise', prompt: 'Write about a surprise birthday celebration.' },
      { id: 5, title: 'A New Friend', prompt: 'Tell a story about making a new friend.' },
    ],
    minWords: 20,
    targetWords: 50,
    timeLimit: 300, // 5 minutes
  },
  medium: {
    prompts: [
      { id: 1, title: 'The Mystery Box', prompt: 'You find a mysterious box on your doorstep. What\'s inside and what happens next?' },
      { id: 2, title: 'Time Travel', prompt: 'If you could go back in time, where would you go? What would you do?' },
      { id: 3, title: 'The Hidden Treasure', prompt: 'Tell a story about finding a hidden treasure and what it means to you.' },
      { id: 4, title: 'A Second Chance', prompt: 'Write about someone getting a second chance at something they love.' },
      { id: 5, title: 'The Journey Home', prompt: 'Tell a story about a journey home and what it teaches you.' },
      { id: 6, title: 'An Unexpected Meeting', prompt: 'Write about meeting someone unexpected and how it changes your day.' },
    ],
    minWords: 50,
    targetWords: 100,
    timeLimit: 420, // 7 minutes
  },
  hard: {
    prompts: [
      { id: 1, title: 'The Choice', prompt: 'A character must make an important choice. Describe the decision, its consequences, and what they learn.' },
      { id: 2, title: 'Overcoming Fear', prompt: 'Tell a detailed story about someone overcoming their deepest fear and finding courage.' },
      { id: 3, title: 'Legacy', prompt: 'Write about a character\'s legacy and how they want to be remembered by their loved ones.' },
      { id: 4, title: 'Redemption', prompt: 'Tell a story about someone making amends and finding redemption.' },
      { id: 5, title: 'The Gift of Time', prompt: 'Write a story about how one moment or conversation changed someone\'s entire perspective.' },
      { id: 6, title: 'Connections', prompt: 'Tell a story that shows how different people\'s lives are connected in unexpected ways.' },
      { id: 7, title: 'Wisdom', prompt: 'Write about a character learning an important life lesson from an unexpected source.' },
    ],
    minWords: 100,
    targetWords: 200,
    timeLimit: 540, // 9 minutes
  },
};

const StoryBuilderGame = ({ route, navigation }) => {
  const { getTextSize, settings } = useSettings();
  const difficulty = route?.params?.difficulty || 'easy';
  const gameConfig = STORY_SETS[difficulty];

  // Game state
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [storyText, setStoryText] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameConfig.timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [gameSubmitted, setGameSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [storiesCompleted, setStoriesCompleted] = useState(0);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameOver || gameSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          saveGameSession(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, gameSubmitted]);

  // Update word count
  useEffect(() => {
    const words = storyText.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [storyText]);

  const initializeGame = () => {
    setCurrentPromptIndex(0);
    setStoryText('');
    setScore(0);
    setTimeLeft(gameConfig.timeLimit);
    setGameOver(false);
    setGameSubmitted(false);
    setWordCount(0);
    setStoriesCompleted(0);
    console.log('[StoryBuilderGame] Game initialized with', gameConfig.prompts.length, 'prompts');
  };

  const calculateStoryScore = () => {
    // Score based on word count relative to target
    let storyScore = 0;

    if (wordCount >= gameConfig.minWords) {
      if (wordCount >= gameConfig.targetWords) {
        storyScore = 50; // Full points for reaching target
      } else {
        // Partial points for meeting minimum
        const progress = (wordCount - gameConfig.minWords) / (gameConfig.targetWords - gameConfig.minWords);
        storyScore = Math.round(30 + progress * 20);
      }
    } else {
      // Half points for submitting below minimum
      storyScore = Math.round((wordCount / gameConfig.minWords) * 15);
    }

    return Math.max(0, storyScore);
  };

  const handleSubmitStory = () => {
    const storyScore = calculateStoryScore();

    if (wordCount < gameConfig.minWords) {
      Alert.alert(
        'Story Too Short',
        `Your story has ${wordCount} words. Try to write at least ${gameConfig.minWords} words.`,
        [
          { text: 'Keep Writing', onPress: () => {} },
          { text: 'Submit Anyway', onPress: () => submitStory(storyScore) },
        ]
      );
    } else {
      submitStory(storyScore);
    }
  };

  const submitStory = (storyScore) => {
    setScore((prev) => prev + storyScore);
    setStoriesCompleted((prev) => prev + 1);
    setStoryText('');

    if (currentPromptIndex < gameConfig.prompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      setGameSubmitted(true);
      saveGameSession(true);
    }
  };

  const handleSkipPrompt = () => {
    if (currentPromptIndex < gameConfig.prompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
      setStoryText('');
    } else {
      setGameSubmitted(true);
      saveGameSession(true);
    }
  };

  const saveGameSession = async (won = false) => {
    try {
      const user = auth().currentUser;
      if (!user?.uid) return;

      const sessionData = {
        gameId: 6, // Story Builder
        difficulty,
        won,
        score,
        storiesCompleted,
        timeSpent: gameConfig.timeLimit - timeLeft,
        timestamp: new Date().toISOString(),
      };

      await logGameSession(user.uid, 6, sessionData);
      console.log('[StoryBuilderGame] Session saved:', sessionData);
    } catch (error) {
      console.error('[StoryBuilderGame] Error saving session:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPrompt = gameConfig.prompts[currentPromptIndex];
  const progressPercentage = (currentPromptIndex + 1) / gameConfig.prompts.length;

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Story Builder
          </Text>
          <Text style={[styles.difficultyBadge, { fontSize: getTextSize(12) }]}>
            {difficulty.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Icon name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
        <View style={styles.statBox}>
          <Icon name="clock" size={24} color={timeLeft <= 30 ? colors.error : colors.primary} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: timeLeft <= 30 ? colors.error : colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Time</Text>
        </View>

        <View style={styles.statBox}>
          <Icon name="star" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {score}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
        </View>

        <View style={styles.statBox}>
          <Icon name="pencil" size={24} color={colors.success} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {wordCount}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Words</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressSection, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#FFF' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Story {currentPromptIndex + 1} of {gameConfig.prompts.length}
          </Text>
        </View>
        <ProgressBar
          progress={progressPercentage}
          color={colors.success}
          style={[styles.progressBar, settings.highContrast && { backgroundColor: '#333' }]}
        />
      </View>

      {/* Story Prompt and Input */}
      {!gameOver && !gameSubmitted && currentPrompt && (
        <View style={[styles.storySection, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          {/* Prompt Card */}
          <Card style={[styles.promptCard, settings.highContrast && { backgroundColor: '#222', borderWidth: 2, borderColor: '#FFF' }]}>
            <Card.Content>
              <Text style={[styles.promptTitle, { fontSize: getTextSize(18), color: colors.primary }, settings.highContrast && { color: '#FFF' }]}>
                {currentPrompt.title}
              </Text>
              <Text style={[styles.promptText, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
                {currentPrompt.prompt}
              </Text>
              <View style={styles.guidelineRow}>
                <Icon name="target" size={16} color={colors.gray} />
                <Text style={[styles.guideline, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>
                  Target: {gameConfig.targetWords} words
                </Text>
              </View>
              <View style={styles.guidelineRow}>
                <Icon name="check-circle" size={16} color={colors.gray} />
                <Text style={[styles.guideline, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>
                  Minimum: {gameConfig.minWords} words
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Story Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
              Your Story:
            </Text>
            <TextInput
              style={[
                styles.storyInput,
                { fontSize: getTextSize(14), color: colors.text },
                settings.highContrast && {
                  backgroundColor: '#222',
                  borderWidth: 2,
                  borderColor: '#FFF',
                  color: '#FFF',
                },
              ]}
              placeholder="Write your story here..."
              placeholderTextColor={settings.highContrast ? '#888' : colors.gray}
              multiline={true}
              numberOfLines={10}
              value={storyText}
              onChangeText={setStoryText}
              editable={!gameOver && !gameSubmitted}
            />
            <View style={styles.wordCountRow}>
              <Text style={[styles.wordCountText, { fontSize: getTextSize(12), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
                {wordCount} words
              </Text>
              <Text
                style={[
                  styles.wordCountTarget,
                  { fontSize: getTextSize(12) },
                  wordCount >= gameConfig.minWords && { color: colors.success },
                  wordCount < gameConfig.minWords && { color: colors.error },
                ]}
              >
                {wordCount < gameConfig.minWords ? `(${gameConfig.minWords - wordCount} more needed)` : '✓ Ready to submit'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Submitted Screen */}
      {gameSubmitted && (
        <View style={[styles.resultScreen, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          <Icon name="star-circle" size={80} color={colors.success} />
          <Text style={[styles.resultTitle, { fontSize: getTextSize(28), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
            Stories Complete!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You wrote {storiesCompleted} stories and earned {score} points!
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Total Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(28), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Stories</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(28), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                {storiesCompleted}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Game Over Screen */}
      {gameOver && !gameSubmitted && (
        <View style={[styles.resultScreen, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          <Icon name="clock-alert" size={80} color={colors.error} />
          <Text style={[styles.resultTitle, { fontSize: getTextSize(28), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
            Time's Up!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You completed {storiesCompleted} stories
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Final Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(28), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!gameSubmitted && !gameOver && (
          <>
            <Button
              mode="contained"
              onPress={handleSubmitStory}
              disabled={wordCount < gameConfig.minWords}
              style={[styles.button, { backgroundColor: colors.success }]}
              labelStyle={{ fontSize: getTextSize(14) }}
            >
              Submit Story
            </Button>
            <Button
              mode="outlined"
              onPress={handleSkipPrompt}
              style={[styles.button, { borderColor: colors.warning }]}
              labelStyle={{ fontSize: getTextSize(14), color: colors.warning }}
            >
              Skip to Next
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setGameSubmitted(true);
                saveGameSession(false);
              }}
              style={[styles.button, { borderColor: colors.error }]}
              labelStyle={{ fontSize: getTextSize(14), color: colors.error }}
            >
              Finish Game
            </Button>
          </>
        )}

        {(gameSubmitted || gameOver) && (
          <>
            <Button
              mode="contained"
              onPress={() => initializeGame()}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={{ fontSize: getTextSize(14) }}
            >
              Play Again
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={{ fontSize: getTextSize(14), color: colors.primary }}
            >
              Back to Games
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerContent: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  difficultyBadge: {
    fontSize: 12,
    color: colors.warning,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  progressHeader: {
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  storySection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  promptCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.lightBlue,
    borderRadius: 8,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  guideline: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  storyInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 200,
  },
  wordCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  wordCountText: {
    fontSize: 12,
    color: colors.gray,
  },
  wordCountTarget: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultScreen: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    color: colors.success,
  },
  resultSubtitle: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    width: '100%',
  },
  resultStatItem: {
    alignItems: 'center',
  },
  resultStatLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  resultStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    color: colors.success,
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

export default StoryBuilderGame;
