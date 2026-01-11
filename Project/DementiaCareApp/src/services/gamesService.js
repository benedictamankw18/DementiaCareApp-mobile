/**
 * Games Service
 * Dementia Care Mobile Application
 * 
 * Manages game data, player stats, and game interactions
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Game Data Model
 */
const GAMES = [
  {
    id: 1,
    title: 'Memory Match',
    description: 'Match pairs of cards to improve memory',
    icon: 'cards',
    color: '#FF6B6B',
    difficulty: 'Easy',
    duration: '5-10 min',
    category: 'Memory',
  },
  {
    id: 2,
    title: 'Word Puzzle',
    description: 'Find words in the letter grid',
    icon: 'alphabetical',
    color: '#4ECDC4',
    difficulty: 'Medium',
    duration: '10-15 min',
    category: 'Language',
  },
  {
    id: 3,
    title: 'Picture Recognition',
    description: 'Identify and name common objects',
    icon: 'image-multiple',
    color: '#95E1D3',
    difficulty: 'Easy',
    duration: '5 min',
    category: 'Recognition',
  },
  {
    id: 4,
    title: 'Number Sequence',
    description: 'Complete the number patterns',
    icon: 'numeric',
    color: '#F38181',
    difficulty: 'Medium',
    duration: '10 min',
    category: 'Logic',
  },
  {
    id: 5,
    title: 'Color Match',
    description: 'Match colors and improve visual skills',
    icon: 'palette',
    color: '#AA96DA',
    difficulty: 'Easy',
    duration: '5 min',
    category: 'Visual',
  },
  {
    id: 6,
    title: 'Story Builder',
    description: 'Create stories from picture sequences',
    icon: 'book-open-page-variant',
    color: '#FCBAD3',
    difficulty: 'Medium',
    duration: '15 min',
    category: 'Creativity',
  },
];

/**
 * Player Stats Model
 */
const DEFAULT_STATS = {
  totalGames: 42,
  streak: 7,
  achievements: 12,
};

/**
 * Get all available games
 * @returns {array} Array of game objects
 */
export const getAllGames = () => {
  return GAMES;
};

/**
 * Get game by ID
 * @param {number} gameId - Game ID
 * @returns {object} Game object or null if not found
 */
export const getGameById = (gameId) => {
  return GAMES.find(game => game.id === gameId) || null;
};

/**
 * Get games by category
 * @param {string} category - Game category (e.g., 'Memory', 'Language')
 * @returns {array} Array of games in the category
 */
export const getGamesByCategory = (category) => {
  return GAMES.filter(game => game.category === category);
};

/**
 * Get games by difficulty
 * @param {string} difficulty - Difficulty level ('Easy', 'Medium', 'Hard')
 * @returns {array} Array of games with matching difficulty
 */
export const getGamesByDifficulty = (difficulty) => {
  return GAMES.filter(game => game.difficulty === difficulty);
};

/**
 * Get player stats with real-time Firestore listener
 * @param {string} patientId - Patient ID
 * @param {function} onStatsChange - Callback when stats change
 * @returns {function} Unsubscribe function for listener
 */
export const listenToPlayerStats = (patientId, onStatsChange) => {
  if (!patientId) {
    console.warn('[gamesService] No patientId provided for stats listener');
    onStatsChange(DEFAULT_STATS);
    return () => {};
  }

  try {
    const unsubscribe = firestore()
      .collection('patients')
      .doc(patientId)
      .collection('gameSessions')
      .onSnapshot(
        (snapshot) => {
          try {
            // Calculate stats from game sessions
            const sessions = snapshot.docs.map(doc => doc.data());
            const stats = calculateStatsFromSessions(sessions);
            onStatsChange(stats);
            console.log('[gamesService] Stats updated from Firestore:', stats);
          } catch (error) {
            console.error('[gamesService] Error processing stats snapshot:', error);
            onStatsChange(DEFAULT_STATS);
          }
        },
        (error) => {
          console.error('[gamesService] Error setting up stats listener:', error);
          onStatsChange(DEFAULT_STATS);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('[gamesService] Error creating stats listener:', error);
    onStatsChange(DEFAULT_STATS);
    return () => {};
  }
};

/**
 * Calculate stats from game sessions
 * @param {array} sessions - Array of game session objects
 * @returns {object} Calculated stats
 */
const calculateStatsFromSessions = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return DEFAULT_STATS;
  }

  let totalGames = sessions.length;
  let totalScore = 0;
  let achievements = 0;

  // Count wins and calculate score
  sessions.forEach(session => {
    if (session.score) {
      totalScore += session.score;
    }
    if (session.won) {
      achievements++;
    }
  });

  // Calculate streak (days in a row with games played)
  const streak = calculateGameStreak(sessions);

  return {
    totalGames,
    streak,
    achievements,
    totalScore,
  };
};

/**
 * Calculate game streak from sessions
 * @param {array} sessions - Array of game session objects
 * @returns {number} Current streak count
 */
const calculateGameStreak = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;

  // Sort sessions by date (newest first)
  const sortedSessions = sessions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dayDiff > streak) {
      break;
    }
  }

  return streak;
};

/**
 * Get player stats (static version)
 * @param {string} patientId - Patient ID (optional, for future Firestore integration)
 * @returns {object} Player stats object
 */
export const getPlayerStats = (patientId = null) => {
  // TODO: In future, fetch from Firestore: firestore().collection('patients').doc(patientId).collection('stats')
  return DEFAULT_STATS;
};

/**
 * Get daily challenge with real-time listener
 * @param {string} patientId - Patient ID
 * @param {function} onChallengeChange - Callback when challenge changes
 * @returns {function} Unsubscribe function for listener
 */
export const listenToDailyChallenge = (patientId, onChallengeChange) => {
  if (!patientId) {
    console.warn('[gamesService] No patientId provided for daily challenge listener');
    onChallengeChange(getDailyChallenge());
    return () => {};
  }

  try {
    const unsubscribe = firestore()
      .collection('patients')
      .doc(patientId)
      .collection('gameSessions')
      .onSnapshot(
        (snapshot) => {
          try {
            // Calculate daily challenge progress from today's game sessions
            const sessions = snapshot.docs.map(doc => doc.data());
            const challenge = calculateDailyChallengeProgress(sessions);
            onChallengeChange(challenge);
            console.log('[gamesService] Daily challenge updated from Firestore:', challenge);
          } catch (error) {
            console.error('[gamesService] Error processing challenge snapshot:', error);
            onChallengeChange(getDailyChallenge());
          }
        },
        (error) => {
          console.error('[gamesService] Error setting up challenge listener:', error);
          onChallengeChange(getDailyChallenge());
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('[gamesService] Error creating challenge listener:', error);
    onChallengeChange(getDailyChallenge());
    return () => {};
  }
};

/**
 * Calculate daily challenge progress from game sessions
 * @param {array} sessions - Array of game session objects
 * @returns {object} Daily challenge object with progress
 */
const calculateDailyChallengeProgress = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return getDailyChallenge();
  }

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count games completed today
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });

  const completed = todaySessions.length;
  const target = 3;

  return {
    title: 'Complete 3 Memory Games',
    description: 'Earn bonus points and achievements',
    target,
    completed: Math.min(completed, target), // Cap at target
    reward: 'Bonus Points',
    icon: 'star-circle',
  };
};

/**
 * Get daily challenge (static version)
 * @returns {object} Daily challenge object
 */
export const getDailyChallenge = () => {
  return {
    title: 'Complete 3 Memory Games',
    description: 'Earn bonus points and achievements',
    target: 3,
    completed: 0,
    reward: 'Bonus Points',
    icon: 'star-circle',
  };
};

/**
 * Get all game categories
 * @returns {array} Array of unique categories
 */
export const getCategories = () => {
  const categories = new Set(GAMES.map(game => game.category));
  return Array.from(categories);
};

/**
 * Get all difficulty levels
 * @returns {array} Array of unique difficulty levels
 */
export const getDifficultyLevels = () => {
  const difficulties = new Set(GAMES.map(game => game.difficulty));
  return Array.from(difficulties);
};

/**
 * Log game session
 * @param {string} patientId - Patient ID
 * @param {number} gameId - Game ID
 * @param {object} session - Session data (score, time, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const logGameSession = async (patientId, gameId, session) => {
  try {
    if (!patientId) {
      console.warn('[gamesService] No patientId provided for game session');
      return false;
    }

    // Save to Firestore
    await firestore()
      .collection('patients')
      .doc(patientId)
      .collection('gameSessions')
      .add({
        ...session,
        gameId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('[gamesService] Game session logged:', { patientId, gameId, session });
    return true;
  } catch (error) {
    console.error('[gamesService] Error logging game session:', error);
    return false;
  }
};

/**
 * Update player stats
 * @param {string} patientId - Patient ID
 * @param {object} statsUpdate - Partial stats update
 * @returns {Promise<boolean>} Success status
 */
export const updatePlayerStats = async (patientId, statsUpdate) => {
  try {
    // TODO: Update in Firestore: firestore().collection('patients').doc(patientId).set({ stats: statsUpdate }, { merge: true })
    console.log('[gamesService] Player stats updated:', { patientId, statsUpdate });
    return true;
  } catch (error) {
    console.error('[gamesService] Error updating player stats:', error);
    return false;
  }
};

export default {
  getAllGames,
  getGameById,
  getGamesByCategory,
  getGamesByDifficulty,
  getPlayerStats,
  getDailyChallenge,
  getCategories,
  getDifficultyLevels,
  logGameSession,
  updatePlayerStats,
};
