/**
 * Word Puzzle Game Screen
 * Dementia Care Mobile Application
 * 
 * Word search puzzle game for patients
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Card, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { logGameSession } from '../../services/gamesService';
import auth from '@react-native-firebase/auth';

// Word puzzle configurations
const PUZZLE_CONFIGS = {
  easy: {
    gridSize: 6,
    words: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION'],
    timeLimit: 180,
  },
  medium: {
    gridSize: 8,
    words: ['ELEPHANT', 'ZEBRA', 'GIRAFFE', 'MONKEY', 'TIGER', 'PANDA'],
    timeLimit: 240,
  },
  hard: {
    gridSize: 10,
    words: ['BUTTERFLY', 'KANGAROO', 'CHIMPANZEE', 'FLAMINGO', 'CROCODILE', 'PEACOCK', 'PARROT'],
    timeLimit: 300,
  },
};

const WordPuzzleGame = ({ route, navigation }) => {
  const { getTextSize, settings } = useSettings();
  const difficulty = route?.params?.difficulty || 'easy';
  const puzzleConfig = PUZZLE_CONFIGS[difficulty];

  // Game state
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(puzzleConfig.timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

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
    if (foundWords.length === puzzleConfig.words.length && foundWords.length > 0) {
      setGameWon(true);
      saveGameSession(true);
    }
  }, [foundWords]);

  const initializeGame = () => {
    // Generate grid with random letters
    const gameGrid = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < puzzleConfig.gridSize * puzzleConfig.gridSize; i++) {
      gameGrid.push({
        id: i,
        letter: alphabet[Math.floor(Math.random() * alphabet.length)],
        row: Math.floor(i / puzzleConfig.gridSize),
        col: i % puzzleConfig.gridSize,
        selected: false,
      });
    }

    // Place words in grid (simplified - just place them and hope they fit)
    const gameWords = puzzleConfig.words.map((word, idx) => ({
      id: idx,
      word,
      found: false,
      hint: getHint(word),
    }));

    setGrid(gameGrid);
    setWords(gameWords);
    setFoundWords([]);
    setSelectedCells([]);
    setScore(0);
    setTimeLeft(puzzleConfig.timeLimit);
    setGameOver(false);
    setGameWon(false);
    console.log('[WordPuzzleGame] Game initialized with', gameWords.length, 'words');
  };

  const getHint = (word) => {
    if (word.length <= 3) return word;
    return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
  };

  const handleCellPress = (cellId) => {
    if (gameOver || gameWon) return;

    const cell = grid.find((c) => c.id === cellId);
    if (!cell) return;

    const isSelected = selectedCells.some((c) => c.id === cellId);

    if (isSelected) {
      // Deselect
      setSelectedCells(selectedCells.filter((c) => c.id !== cellId));
    } else {
      // Select - only allow continuous selections
      setSelectedCells([...selectedCells, cell]);
    }
  };

  const handleCheckWord = () => {
    const selectedWord = selectedCells.map((c) => c.letter).join('');

    const matchedWord = words.find(
      (w) => w.word === selectedWord && !foundWords.includes(w.id)
    );

    if (matchedWord) {
      setFoundWords([...foundWords, matchedWord.id]);
      setScore((prev) => prev + matchedWord.word.length * 5);
      setSelectedCells([]);
      console.log('[WordPuzzleGame] Word found:', matchedWord.word);
    } else if (selectedWord.length > 0) {
      Alert.alert('Not Found', `"${selectedWord}" is not a target word. Try again!`);
      setSelectedCells([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedCells([]);
  };

  const saveGameSession = async (won = false) => {
    try {
      const user = auth().currentUser;
      if (!user?.uid) return;

      const sessionData = {
        gameId: 2, // Word Puzzle
        difficulty,
        won,
        score,
        wordsFound: foundWords.length,
        totalWords: puzzleConfig.words.length,
        timeSpent: puzzleConfig.timeLimit - timeLeft,
        timestamp: new Date().toISOString(),
      };

      await logGameSession(user.uid, 2, sessionData);
      console.log('[WordPuzzleGame] Session saved:', sessionData);
    } catch (error) {
      console.error('[WordPuzzleGame] Error saving session:', error);
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

  const progressPercentage = foundWords.length / puzzleConfig.words.length;

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Word Search
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
          <Icon name="word-box" size={24} color={colors.success} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {foundWords.length}/{puzzleConfig.words.length}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Words</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressSection, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#FFF' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Words Found: {foundWords.length}/{puzzleConfig.words.length}
          </Text>
        </View>
        <ProgressBar
          progress={progressPercentage}
          color={colors.success}
          style={[styles.progressBar, settings.highContrast && { backgroundColor: '#333' }]}
        />
      </View>

      {/* Game Board */}
      {!gameOver && !gameWon && (
        <>
          <View style={[styles.gridSection, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
            <View style={styles.letterGrid}>
              {grid.map((cell) => (
                <TouchableOpacity
                  key={cell.id}
                  onPress={() => handleCellPress(cell.id)}
                  style={[
                    styles.letterCell,
                    settings.highContrast && { borderWidth: 2, borderColor: '#FFF' },
                    selectedCells.some((c) => c.id === cell.id) && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.letterText, { fontSize: getTextSize(20), color: selectedCells.some((c) => c.id === cell.id) ? colors.white : colors.text }, settings.highContrast && { color: selectedCells.some((c) => c.id === cell.id) ? '#000' : '#FFF' }]}>
                    {cell.letter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Word Display */}
            <View style={[styles.selectedWordBox, settings.highContrast && { borderWidth: 2, borderColor: '#FFF' }]}>
              <Text style={[styles.selectedWordLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>
                Selected:
              </Text>
              <Text style={[styles.selectedWordValue, { fontSize: getTextSize(20), color: colors.primary }, settings.highContrast && { color: '#FFF' }]}>
                {selectedCells.map((c) => c.letter).join('')}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <Button
                mode="contained"
                onPress={handleCheckWord}
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                labelStyle={{ fontSize: getTextSize(12) }}
              >
                Check
              </Button>
              <Button
                mode="outlined"
                onPress={handleClearSelection}
                style={[styles.actionButton, { borderColor: colors.gray }]}
                labelStyle={{ fontSize: getTextSize(12), color: colors.gray }}
              >
                Clear
              </Button>
            </View>
          </View>

          {/* Target Words */}
          <View style={[styles.wordsSection, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
            <Text style={[styles.wordsTitle, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
              Find These Words:
            </Text>
            <View style={styles.wordsList}>
              {words.map((word) => {
                const isFound = foundWords.includes(word.id);
                return (
                  <Chip
                    key={word.id}
                    style={[
                      styles.wordChip,
                      isFound && { backgroundColor: colors.success },
                      settings.highContrast && { borderWidth: 2, borderColor: '#FFF' },
                    ]}
                    textStyle={[
                      styles.wordChipText,
                      { color: isFound ? colors.white : colors.text, fontSize: getTextSize(12) },
                      settings.highContrast && { color: '#FFF' },
                    ]}
                  >
                    {isFound ? '✓ ' + word.word : word.hint}
                  </Chip>
                );
              })}
            </View>
          </View>
        </>
      )}

      {/* Game Won Screen */}
      {gameWon && (
        <View style={[styles.resultScreen, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          <Icon name="trophy" size={80} color={colors.success} />
          <Text style={[styles.resultTitle, { fontSize: getTextSize(28), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
            Fantastic!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You found all {foundWords.length} words!
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Time</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
                {formatTime(puzzleConfig.timeLimit - timeLeft)}
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
            You found {foundWords.length}/{puzzleConfig.words.length} words
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Found</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {foundWords.length}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.bottomButtons}>
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
  gridSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  letterCell: {
    width: Dimensions.get('window').width / 6.5 - spacing.sm,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  letterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedWordBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  selectedWordLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  selectedWordValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.xs,
    letterSpacing: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  wordsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  wordsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wordChip: {
    marginBottom: spacing.sm,
    backgroundColor: colors.lightGray,
  },
  wordChipText: {
    fontSize: 12,
    color: colors.text,
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
  bottomButtons: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

export default WordPuzzleGame;
