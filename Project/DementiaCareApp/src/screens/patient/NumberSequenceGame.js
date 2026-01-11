/**
 * Number Sequence Game Screen
 * Dementia Care Mobile Application
 * 
 * Logic and pattern completion game for patients
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { logGameSession } from '../../services/gamesService';
import auth from '@react-native-firebase/auth';

// Number sequence sets for different difficulty levels
const SEQUENCE_SETS = {
  easy: {
    sequences: [
      { id: 1, sequence: [2, 4, 6, '?', 10], answer: 8, options: [6, 8, 10], hint: 'Even numbers' },
      { id: 2, sequence: [1, 2, 3, '?', 5], answer: 4, options: [3, 4, 5], hint: 'Count up by 1' },
      { id: 3, sequence: [5, 10, 15, '?', 25], answer: 20, options: [18, 20, 22], hint: 'Count by 5s' },
      { id: 4, sequence: [10, 8, 6, '?', 2], answer: 4, options: [2, 4, 6], hint: 'Count down by 2' },
      { id: 5, sequence: [1, 1, 2, '?', 5], answer: 3, options: [2, 3, 4], hint: 'Fibonacci' },
    ],
    timeLimit: 150,
  },
  medium: {
    sequences: [
      { id: 1, sequence: [2, 6, 18, '?', 162], answer: 54, options: [48, 54, 60], hint: 'Multiply by 3' },
      { id: 2, sequence: [1, 4, 9, '?', 25], answer: 16, options: [14, 16, 18], hint: 'Perfect squares' },
      { id: 3, sequence: [100, 90, 81, '?', 64], answer: 71, options: [71, 73, 75], hint: 'Subtract, then pattern' },
      { id: 4, sequence: [2, 3, 5, 7, '?'], answer: 11, options: [9, 11, 13], hint: 'Prime numbers' },
      { id: 5, sequence: [1, 3, 6, 10, '?'], answer: 15, options: [13, 15, 17], hint: 'Triangular numbers' },
      { id: 6, sequence: [1, 2, 4, 8, '?'], answer: 16, options: [14, 16, 18], hint: 'Powers of 2' },
    ],
    timeLimit: 210,
  },
  hard: {
    sequences: [
      { id: 1, sequence: [1, 1, 2, 3, 5, 8, '?'], answer: 13, options: [11, 13, 15], hint: 'Fibonacci sequence' },
      { id: 2, sequence: [2, 6, 12, 20, '?'], answer: 30, options: [28, 30, 32], hint: 'n*(n+1)' },
      { id: 3, sequence: [64, 32, 16, 8, '?'], answer: 4, options: [2, 4, 6], hint: 'Divide by 2' },
      { id: 4, sequence: [1, 8, 27, 64, '?'], answer: 125, options: [100, 125, 150], hint: 'Perfect cubes' },
      { id: 5, sequence: [3, 6, 11, 18, '?'], answer: 27, options: [25, 27, 29], hint: 'Add increasing numbers' },
      { id: 6, sequence: [1, 3, 7, 15, '?'], answer: 31, options: [29, 31, 33], hint: '2^n - 1' },
      { id: 7, sequence: [5, 4, 3, 2, '?', 0], answer: 1, options: [0, 1, 2], hint: 'Counting down' },
    ],
    timeLimit: 270,
  },
};

const NumberSequenceGame = ({ route, navigation }) => {
  const { getTextSize, settings } = useSettings();
  const difficulty = route?.params?.difficulty || 'easy';
  const gameConfig = SEQUENCE_SETS[difficulty];

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameConfig.timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameOver || gameWon) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, gameWon]);

  // Check if game is won
  useEffect(() => {
    if (currentIndex === gameConfig.sequences.length && currentIndex > 0) {
      setGameWon(true);
      saveGameSession(true);
    }
  }, [currentIndex]);

  const initializeGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(gameConfig.timeLimit);
    setGameOver(false);
    setGameWon(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    console.log('[NumberSequenceGame] Game initialized');
  };

  const handleAnswer = (selectedOption) => {
    if (answered) return;

    const currentSequence = gameConfig.sequences[currentIndex];
    const correct = selectedOption === currentSequence.answer;

    setSelectedAnswer(selectedOption);
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      setScore((prev) => prev + 15);
      setStreak((prev) => prev + 1);
      console.log('[NumberSequenceGame] Correct answer:', selectedOption);
    } else {
      setStreak(0);
      console.log('[NumberSequenceGame] Wrong answer:', selectedOption);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const saveGameSession = async (won = false) => {
    try {
      const user = auth().currentUser;
      if (!user?.uid) return;

      const sessionData = {
        gameId: 4, // Number Sequence
        difficulty,
        won,
        score,
        correct: Math.round((score / (currentIndex * 15)) * 100) || 0,
        maxStreak: streak,
        sequences: currentIndex,
        totalSequences: gameConfig.sequences.length,
        timeSpent: gameConfig.timeLimit - timeLeft,
        timestamp: new Date().toISOString(),
      };

      await logGameSession(user.uid, 4, sessionData);
      console.log('[NumberSequenceGame] Session saved:', sessionData);
    } catch (error) {
      console.error('[NumberSequenceGame] Error saving session:', error);
    }
  };

  const handleGameOver = () => {
    saveGameSession(false);
    setGameOver(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = currentIndex / gameConfig.sequences.length;
  const currentSequence = gameConfig.sequences[currentIndex];

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Number Sequence
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
          <Icon name="clock" size={24} color={timeLeft <= 10 ? colors.error : colors.primary} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: timeLeft <= 10 ? colors.error : colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Time</Text>
        </View>

        <View style={styles.statBox}>
          <Icon name="lightning-bolt" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {score}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
        </View>

        <View style={styles.statBox}>
          <Icon name="fire" size={24} color={colors.success} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {streak}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Streak</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressSection, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#FFF' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Sequence {currentIndex + 1} of {gameConfig.sequences.length}
          </Text>
        </View>
        <ProgressBar
          progress={progressPercentage}
          color={colors.success}
          style={[styles.progressBar, settings.highContrast && { backgroundColor: '#333' }]}
        />
      </View>

      {/* Game Content */}
      {!gameOver && !gameWon && currentSequence && (
        <View style={[styles.gameSection, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          {/* Hint */}
          <View style={[styles.hintBox, settings.highContrast && { borderWidth: 1, borderColor: '#FFF' }]}>
            <Icon name="lightbulb-outline" size={20} color={colors.warning} />
            <Text style={[styles.hintText, { fontSize: getTextSize(12), color: colors.warning }, settings.highContrast && { color: '#FFF' }]}>
              {currentSequence.hint}
            </Text>
          </View>

          {/* Sequence Display */}
          <View style={[styles.sequenceContainer, settings.highContrast && { borderWidth: 2, borderColor: '#FFF' }]}>
            <Text style={[styles.sequenceLabel, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
              What comes next?
            </Text>
            <View style={styles.sequenceDisplay}>
              {currentSequence.sequence.map((num, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.sequenceNumber,
                    num === '?' && { backgroundColor: colors.primary },
                    settings.highContrast && { borderWidth: 2, borderColor: '#FFF' },
                  ]}
                >
                  <Text
                    style={[
                      styles.sequenceNumberText,
                      { fontSize: getTextSize(24) },
                      num === '?' && { color: colors.white },
                      settings.highContrast && num !== '?' && { color: '#FFF' },
                    ]}
                  >
                    {num}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentSequence.options.map((option, idx) => {
              const isSelectedOption = selectedAnswer === option;
              let backgroundColor = colors.white;
              let borderColor = colors.lightGray;
              let textColor = colors.text;

              if (answered) {
                if (isSelectedOption && isCorrect) {
                  backgroundColor = colors.success;
                  textColor = colors.white;
                  borderColor = colors.success;
                } else if (isSelectedOption && !isCorrect) {
                  backgroundColor = colors.error;
                  textColor = colors.white;
                  borderColor = colors.error;
                } else if (option === currentSequence.answer && !isCorrect) {
                  backgroundColor = colors.success;
                  textColor = colors.white;
                  borderColor = colors.success;
                } else {
                  backgroundColor = colors.lightGray;
                  borderColor = colors.gray;
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleAnswer(option)}
                  disabled={answered}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor,
                      borderColor,
                    },
                    settings.highContrast && { borderWidth: 2 },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { fontSize: getTextSize(20), color: textColor },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {answered && (
            <>
              <View style={styles.feedbackContainer}>
                {isCorrect ? (
                  <>
                    <Icon name="check-circle" size={48} color={colors.success} />
                    <Text style={[styles.feedbackText, { fontSize: getTextSize(18), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                      Correct! +15 points
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="close-circle" size={48} color={colors.error} />
                    <Text style={[styles.feedbackText, { fontSize: getTextSize(18), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                      Wrong. Answer: {currentSequence.answer}
                    </Text>
                  </>
                )}
              </View>

              {currentIndex < gameConfig.sequences.length - 1 && (
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={[styles.nextButton, { backgroundColor: colors.primary }]}
                  labelStyle={{ fontSize: getTextSize(14) }}
                >
                  Next Sequence
                </Button>
              )}

              {currentIndex === gameConfig.sequences.length - 1 && (
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={[styles.nextButton, { backgroundColor: colors.success }]}
                  labelStyle={{ fontSize: getTextSize(14) }}
                >
                  Finish
                </Button>
              )}
            </>
          )}
        </View>
      )}

      {/* Game Won Screen */}
      {gameWon && (
        <View style={[styles.resultScreen, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          <Icon name="trophy" size={80} color={colors.success} />
          <Text style={[styles.resultTitle, { fontSize: getTextSize(28), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
            Perfect Logic!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You completed all {currentIndex} sequences!
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Streak</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                {streak}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Game Over Screen */}
      {gameOver && !gameWon && (
        <View style={[styles.resultScreen, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          <Icon name="clock-alert" size={80} color={colors.error} />
          <Text style={[styles.resultTitle, { fontSize: getTextSize(28), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
            Time's Up!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You completed {currentIndex}/{gameConfig.sequences.length} sequences
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Max Streak</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {streak}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!gameWon && !gameOver && (
          <Button
            mode="contained"
            onPress={() => {
              handleGameOver();
            }}
            style={[styles.button, { backgroundColor: colors.error }]}
            labelStyle={{ fontSize: getTextSize(14) }}
          >
            Quit Game
          </Button>
        )}

        {(gameWon || gameOver) && (
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
  gameSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: spacing.lg,
  },
  hintText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  sequenceContainer: {
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sequenceLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sequenceDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sequenceNumber: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  sequenceNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  optionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
  },
  optionText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: spacing.lg,
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
    fontSize: 24,
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

export default NumberSequenceGame;
