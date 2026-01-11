/**
 * Memory Match Game Screen
 * Dementia Care Mobile Application
 * 
 * Interactive memory game for patients
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
import { Card, Text, Button, ProgressBar, Icon as PaperIcon } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../styles/theme';
import { useSettings } from '../../state/SettingsContext';
import { logGameSession } from '../../services/gamesService';
import auth from '@react-native-firebase/auth';

const CARD_SYMBOLS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const DIFFICULTY_LEVELS = {
  easy: { pairs: 4, timeLimit: 120 }, // 4 pairs, 2 minutes
  medium: { pairs: 6, timeLimit: 180 }, // 6 pairs, 3 minutes
  hard: { pairs: 8, timeLimit: 240 }, // 8 pairs, 4 minutes
};

const MemoryMatchGame = ({ route, navigation }) => {
  const { getTextSize, settings } = useSettings();
  const difficulty = route?.params?.difficulty || 'easy';
  const gameConfig = DIFFICULTY_LEVELS[difficulty];
  
  // Game state
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameConfig.timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (matched.length === gameConfig.pairs && matched.length > 0) {
      setGameWon(true);
      saveGameSession(true);
    }
  }, [matched]);

  const initializeGame = () => {
    // Create pairs of cards
    const gameCards = [];
    const pairsNeeded = gameConfig.pairs;
    
    for (let i = 0; i < pairsNeeded; i++) {
      gameCards.push(
        { id: i * 2, symbol: CARD_SYMBOLS[i], pairId: i },
        { id: i * 2 + 1, symbol: CARD_SYMBOLS[i], pairId: i }
      );
    }

    // Shuffle cards
    gameCards.sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(gameConfig.timeLimit);
    setGameOver(false);
    setGameWon(false);
    console.log('[MemoryMatchGame] Game initialized with', pairsNeeded, 'pairs');
  };

  const handleCardPress = (cardId) => {
    if (isProcessing || gameOver || gameWon) return;
    if (flipped.includes(cardId) || matched.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves((prev) => prev + 1);

      const card1 = cards.find((c) => c.id === newFlipped[0]);
      const card2 = cards.find((c) => c.id === newFlipped[1]);

      if (card1.pairId === card2.pairId) {
        // Match found
        setMatched([...matched, newFlipped[0], newFlipped[1]]);
        setScore((prev) => prev + 10);
        setFlipped([]);
        setIsProcessing(false);
        console.log('[MemoryMatchGame] Match found!');
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const saveGameSession = async (won = false) => {
    try {
      const user = auth().currentUser;
      if (!user?.uid) return;

      const sessionData = {
        gameId: 1, // Memory Match
        difficulty,
        won,
        score,
        moves,
        timeSpent: gameConfig.timeLimit - timeLeft,
        timestamp: new Date().toISOString(),
      };

      await logGameSession(user.uid, 1, sessionData);
      console.log('[MemoryMatchGame] Session saved:', sessionData);
    } catch (error) {
      console.error('[MemoryMatchGame] Error saving session:', error);
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

  const progressPercentage = matched.length / (gameConfig.pairs * 2);

  return (
    <ScrollView style={[styles.container, settings.highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#FFF' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { fontSize: getTextSize(24), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Memory Match
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
          <Icon name="hand-left" size={24} color={colors.success} />
          <Text style={[styles.statValue, { fontSize: getTextSize(18), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            {moves}
          </Text>
          <Text style={[styles.statLabel, { fontSize: getTextSize(12), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Moves</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressSection, settings.highContrast && { backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#FFF' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: getTextSize(14), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            Pairs Found: {matched.length / 2}/{gameConfig.pairs}
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
        <View style={styles.gameBoard}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardPress(card.id)}
              style={[
                styles.card,
                settings.highContrast && { borderWidth: 2, borderColor: '#FFF' },
                flipped.includes(card.id) || matched.includes(card.id)
                  ? [styles.cardFlipped, { backgroundColor: colors.primary }]
                  : [styles.cardBack, { backgroundColor: colors.primary }],
              ]}
              disabled={isProcessing}
            >
              {(flipped.includes(card.id) || matched.includes(card.id)) && (
                <Text style={[styles.cardSymbol, { fontSize: getTextSize(40) }]}>
                  {card.symbol}
                </Text>
              )}
              {!flipped.includes(card.id) && !matched.includes(card.id) && (
                <Icon name="help" size={36} color={colors.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Game Won Screen */}
      {gameWon && (
        <View style={[styles.resultScreen, settings.highContrast && { backgroundColor: '#1a1a1a' }]}>
          <Icon name="trophy" size={80} color={colors.success} />
          <Text style={[styles.resultTitle, { fontSize: getTextSize(28), color: colors.success }, settings.highContrast && { color: '#FFF' }]}>
            Congratulations!
          </Text>
          <Text style={[styles.resultSubtitle, { fontSize: getTextSize(16), color: colors.text }, settings.highContrast && { color: '#FFF' }]}>
            You won in {moves} moves!
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
                {formatTime(gameConfig.timeLimit - timeLeft)}
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
            You found {matched.length / 2}/{gameConfig.pairs} pairs
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Score</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {score}
              </Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatLabel, { fontSize: getTextSize(14), color: colors.gray }, settings.highContrast && { color: '#FFF' }]}>Moves</Text>
              <Text style={[styles.resultStatValue, { fontSize: getTextSize(24), color: colors.error }, settings.highContrast && { color: '#FFF' }]}>
                {moves}
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
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: Dimensions.get('window').width / 2 - spacing.lg - spacing.sm,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    elevation: 3,
  },
  cardFlipped: {
    backgroundColor: colors.success,
  },
  cardBack: {
    backgroundColor: colors.primary,
  },
  cardSymbol: {
    fontSize: 40,
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

export default MemoryMatchGame;
