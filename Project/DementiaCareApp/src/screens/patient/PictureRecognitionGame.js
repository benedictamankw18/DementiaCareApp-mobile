/**
 * Picture Recognition Game Screen
 * Dementia Care Mobile Application
 * 
 * Image recognition and naming game for patients
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { logGameSession } from '../../services/gamesService';
import auth from '@react-native-firebase/auth';

// Picture sets for different difficulty levels
const PICTURE_SETS = {
  easy: {
    pictures: [
      { id: 1, emoji: '🐶', name: 'DOG', alternatives: ['PUPPY', 'ANIMAL'] },
      { id: 2, emoji: '🐱', name: 'CAT', alternatives: ['KITTEN', 'PET'] },
      { id: 3, emoji: '🍎', name: 'APPLE', alternatives: ['FRUIT', 'RED'] },
      { id: 4, emoji: '🌳', name: 'TREE', alternatives: ['PLANT', 'GREEN'] },
      { id: 5, emoji: '☀️', name: 'SUN', alternatives: ['BRIGHT', 'YELLOW'] },
    ],
    timeLimit: 120,
  },
  medium: {
    pictures: [
      { id: 1, emoji: '🦁', name: 'LION', alternatives: ['ANIMAL', 'WILD'] },
      { id: 2, emoji: '🦋', name: 'BUTTERFLY', alternatives: ['INSECT', 'FLYING'] },
      { id: 3, emoji: '🌺', name: 'FLOWER', alternatives: ['PLANT', 'BLOOM'] },
      { id: 4, emoji: '🎸', name: 'GUITAR', alternatives: ['INSTRUMENT', 'MUSIC'] },
      { id: 5, emoji: '📚', name: 'BOOK', alternatives: ['READ', 'LEARN'] },
      { id: 6, emoji: '🍕', name: 'PIZZA', alternatives: ['FOOD', 'ITALIAN'] },
    ],
    timeLimit: 180,
  },
  hard: {
    pictures: [
      { id: 1, emoji: '🦋', name: 'BUTTERFLY', alternatives: ['INSECT', 'FLYING'] },
      { id: 2, emoji: '🎻', name: 'VIOLIN', alternatives: ['INSTRUMENT', 'MUSIC'] },
      { id: 3, emoji: '🏰', name: 'CASTLE', alternatives: ['BUILDING', 'FORTRESS'] },
      { id: 4, emoji: '🌸', name: 'BLOSSOM', alternatives: ['FLOWER', 'SPRING'] },
      { id: 5, emoji: '⚡', name: 'LIGHTNING', alternatives: ['STORM', 'THUNDER'] },
      { id: 6, emoji: '🎭', name: 'THEATER', alternatives: ['DRAMA', 'PERFORMANCE'] },
      { id: 7, emoji: '🔬', name: 'SCIENCE', alternatives: ['LABORATORY', 'EXPERIMENT'] },
    ],
    timeLimit: 240,
  },
};

const PictureRecognitionGame = ({ route, navigation }) => {
  const { getTextSize, settings } = useSettings();
  const difficulty = route?.params?.difficulty || 'easy';
  const gameConfig = PICTURE_SETS[difficulty];

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameConfig.timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [options, setOptions] = useState([]);
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
    if (currentIndex === gameConfig.pictures.length && currentIndex > 0) {
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
    generateOptions(0);
    console.log('[PictureRecognitionGame] Game initialized');
  };

  const generateOptions = (pictureIndex) => {
    const currentPicture = gameConfig.pictures[pictureIndex];
    if (!currentPicture) return;

    // Get wrong answers from other pictures
    const wrongAnswers = gameConfig.pictures
      .filter((p, idx) => idx !== pictureIndex)
      .slice(0, 2)
      .map((p) => p.name);

    // Combine and shuffle
    const allOptions = [currentPicture.name, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    setOptions(allOptions);
  };

  const handleAnswer = (selectedOption) => {
    if (answered) return;

    const currentPicture = gameConfig.pictures[currentIndex];
    const correct =
      selectedOption === currentPicture.name ||
      currentPicture.alternatives.includes(selectedOption);

    setSelectedAnswer(selectedOption);
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
      console.log('[PictureRecognitionGame] Correct answer:', selectedOption);
    } else {
      setStreak(0);
      console.log('[PictureRecognitionGame] Wrong answer:', selectedOption);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (nextIndex < gameConfig.pictures.length) {
      generateOptions(nextIndex);
    }
  };

  const saveGameSession = async (won = false) => {
    try {
      const user = auth().currentUser;
      if (!user?.uid) return;

      const sessionData = {
        gameId: 3, // Picture Recognition
        difficulty,
        won,
        score,
        correct: Math.round((score / (currentIndex * 10)) * 100) || 0,
        maxStreak: streak,
        pictures: currentIndex,
        totalPictures: gameConfig.pictures.length,
        timeSpent: gameConfig.timeLimit - timeLeft,
        timestamp: new Date().toISOString(),
      };

      await logGameSession(user.uid, 3, sessionData);
      console.log('[PictureRecognitionGame] Session saved:', sessionData);
    } catch (error) {
      console.error('[PictureRecognitionGame] Error saving session:', error);
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

  const progressPercentage = currentIndex / gameConfig.pictures.length;
  const currentPicture = gameConfig.pictures[currentIndex];

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Picture Recognition
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
            Picture {currentIndex + 1} of {gameConfig.pictures.length}
          </Text>
        </View>
        <ProgressBar
          progress={progressPercentage}
          color={colors.success}
          style={[styles.progressBar, settings.highContrast && { backgroundColor: '#333' }]}
        />
      </View>

      {/* Game Content */}
      {!gameOver && !gameWon && currentPicture && (
        <View style={[styles.gameSection, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          {/* Picture Display */}
          <View style={[styles.pictureContainer, settings.highContrast && { borderWidth: 2, borderColor: '#FFF' }]}>
            <Text style={[styles.pictureEmoji, { fontSize: getTextSize(120) }]}>
              {currentPicture.emoji}
            </Text>
            <Text style={[styles.questionText, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
              What is this?
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, idx) => {
              const isSelectedOption = selectedAnswer === option;
              const isCorrectOption = option === currentPicture.name;
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
                } else if (isCorrectOption && !isCorrect) {
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
                      { fontSize: getTextSize(16), color: textColor },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          {answered && (
            <>
              <View style={styles.feedbackContainer}>
                {isCorrect ? (
                  <>
                    <Icon name="check-circle" size={48} color={colors.success} />
                    <Text style={[styles.feedbackText, { fontSize: getTextSize(18), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                      Correct!
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="close-circle" size={48} color={colors.error} />
                    <Text style={[styles.feedbackText, { fontSize: getTextSize(18), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                      Incorrect. The answer is {currentPicture.name}
                    </Text>
                  </>
                )}
              </View>

              {currentIndex < gameConfig.pictures.length - 1 && (
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={[styles.nextButton, { backgroundColor: colors.primary }]}
                  labelStyle={{ fontSize: getTextSize(14) }}
                >
                  Next Picture
                </Button>
              )}

              {currentIndex === gameConfig.pictures.length - 1 && (
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
            Excellent!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You recognized all {currentIndex} pictures!
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
            You recognized {currentIndex}/{gameConfig.pictures.length} pictures
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
  pictureContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: spacing.lg,
  },
  pictureEmoji: {
    fontSize: 120,
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: spacing.md,
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
    fontSize: 16,
    fontWeight: '600',
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

export default PictureRecognitionGame;
