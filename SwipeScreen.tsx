/**
 * SwipeScreen Component
 * 
 * The main gameplay screen where users swipe through Pokemon.
 * Implements Tinder-style card swiping with gesture support.
 * 
 * FEATURES:
 * - Fetches random Pokemon from PokeAPI
 * - Gesture-based card swiping (drag left/right)
 * - Button-based like/dislike
 * - Animated card movements with rotation
 * - Live "LIKE"/"NOPE" overlay indicators
 * - Haptic feedback on actions
 * - Prefetching for smooth transitions
 * - Stacked card visual effect
 * 
 * ANIMATIONS:
 * - Card rotation based on drag position
 * - Opacity changes during drag
 * - Smooth spring animations when releasing card
 * - Fly-out animation on swipe completion
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePokemon } from '../context/PokemonContext';
import { lightTheme, darkTheme } from '../context/ThemeContext';
import { Pokemon } from '../types/pokemon';
import { fetchRandomPokemon, getOfficialArtworkUrl } from '../services/pokeApi';
import Header from '../components/Header';
import PokemonCard from '../components/PokemonCard';

// Get device dimensions for responsive calculations
const { width } = Dimensions.get('window');
// Card width - responsive but capped at 380px
const CARD_WIDTH = Math.min(width - 40, 380);
// Minimum drag distance required to trigger a swipe action
const SWIPE_THRESHOLD = width * 0.25;
// Duration of the fly-out animation in milliseconds
const SWIPE_OUT_DURATION = 400;

// Navigation type definitions
type RootStackParamList = {
  Welcome: undefined;
  Swipe: undefined;
  Liked: undefined;
};

type SwipeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Swipe'>;
};

/**
 * SwipeScreen Component
 * 
 * @param navigation - React Navigation prop for screen navigation
 */
const SwipeScreen: React.FC<SwipeScreenProps> = ({ navigation }) => {
  // ==================== STATE & CONTEXT ====================
  
  // Access global state from PokemonContext
  const {
    isDarkMode,
    toggleDarkMode,
    addLikedPokemon,
    likedPokemon,
    isLiked,
    addSeenPokemon,
    seenPokemonIds,
  } = usePokemon();
  
  // Select theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Current Pokemon being displayed
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  // Next Pokemon (prefetched for smooth transitions)
  const [nextPokemon, setNextPokemon] = useState<Pokemon | null>(null);
  // Loading state for initial fetch
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // Error state for failed API calls
  const [error, setError] = useState<string | null>(null);
  // Prevents multiple animations from running simultaneously
  const [isAnimating, setIsAnimating] = useState(false);

  // ==================== ANIMATIONS ====================
  
  // Animated position value for card dragging
  const position = useRef(new Animated.ValueXY()).current;
  
  /**
   * Card rotation interpolation
   * Rotates the card based on horizontal drag position
   * -12deg at left edge, 0deg at center, +12deg at right edge
   */
  const rotation = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });
  
  /**
   * Like overlay opacity interpolation
   * Shows "LIKE" text when dragging right
   */
  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  /**
   * Dislike overlay opacity interpolation
   * Shows "NOPE" text when dragging left
   */
  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // ==================== GESTURE HANDLING ====================
  
  /**
   * PanResponder for handling drag gestures
   * Allows users to drag the card left/right
   */
  const panResponder = useRef(
    PanResponder.create({
      // Only respond to gestures when not animating
      onStartShouldSetPanResponder: () => !isAnimating,
      // Require minimum horizontal movement to start gesture
      onMoveShouldSetPanResponder: (_, gesture) => {
        return !isAnimating && Math.abs(gesture.dx) > 5;
      },
      // Update card position as user drags
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.5 });
      },
      // Handle gesture release - determine if swipe or reset
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Dragged far enough right - trigger like
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Dragged far enough left - trigger dislike
          swipeLeft();
        } else {
          // Not far enough - reset to center
          resetPosition();
        }
      },
    })
  ).current;

  // ==================== API & DATA FETCHING ====================
  
  /**
   * Fetches a single Pokemon from the API
   * Attempts to find one the user hasn't seen before
   * Also prefetches the Pokemon's image for faster display
   * 
   * @returns Pokemon object or null if fetch fails
   */
  const fetchPokemon = useCallback(async (): Promise<Pokemon | null> => {
    try {
      let pokemon: Pokemon;
      let attempts = 0;
      const maxAttempts = 10;

      // Try to find a Pokemon not yet seen by the user
      do {
        pokemon = await fetchRandomPokemon();
        attempts++;
      } while (
        seenPokemonIds.includes(pokemon.id) &&
        attempts < maxAttempts
      );

      // Prefetch the image for faster loading
      Image.prefetch(getOfficialArtworkUrl(pokemon.id));
      
      return pokemon;
    } catch (err) {
      console.error('Error fetching Pokemon:', err);
      return null;
    }
  }, [seenPokemonIds]);

  /**
   * Prefetches the next Pokemon in the background
   * Called after displaying a new Pokemon for smooth transitions
   */
  const prefetchNext = useCallback(async () => {
    const pokemon = await fetchPokemon();
    if (pokemon) {
      setNextPokemon(pokemon);
    }
  }, [fetchPokemon]);

  /**
   * Initial data fetch on component mount
   * Fetches first Pokemon and starts prefetching next
   */
  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      const pokemon = await fetchPokemon();
      if (pokemon) {
        setCurrentPokemon(pokemon);
        addSeenPokemon(pokemon.id);
        prefetchNext();
      } else {
        setError('Failed to fetch Pokémon. Please try again.');
      }
      setIsInitialLoading(false);
    };
    init();
  }, []);

  // ==================== ANIMATION HELPERS ====================
  
  /**
   * Resets card position to center with spring animation
   * Called when user releases card without completing swipe
   */
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Advances to the next Pokemon
   * Uses prefetched Pokemon if available, otherwise fetches new one
   */
  const moveToNext = useCallback(async () => {
    if (nextPokemon) {
      // Use prefetched Pokemon for instant transition
      setCurrentPokemon(nextPokemon);
      addSeenPokemon(nextPokemon.id);
      setNextPokemon(null);
      // Start prefetching the next one
      prefetchNext();
    } else {
      // Fallback: fetch new Pokemon if prefetch wasn't ready
      const pokemon = await fetchPokemon();
      if (pokemon) {
        setCurrentPokemon(pokemon);
        addSeenPokemon(pokemon.id);
        prefetchNext();
      }
    }
  }, [nextPokemon, fetchPokemon, addSeenPokemon, prefetchNext]);

  // ==================== SWIPE ACTIONS ====================
  
  /**
   * Handles swipe right (Like) action
   * - Triggers haptic feedback
   * - Animates card flying off to the right
   * - Adds Pokemon to liked collection
   * - Moves to next Pokemon
   */
  const swipeRight = () => {
    if (isAnimating || !currentPokemon) return;
    setIsAnimating(true);
    
    // Haptic feedback for tactile response
    Vibration.vibrate(50);

    // Animate card flying off screen to the right
    Animated.timing(position, {
      toValue: { x: width * 1.5, y: 50 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Add to liked Pokemon if not already liked
      if (currentPokemon && !isLiked(currentPokemon.id)) {
        addLikedPokemon({
          id: currentPokemon.id,
          name: currentPokemon.name,
          imageUrl: getOfficialArtworkUrl(currentPokemon.id),
          types: currentPokemon.types.map(t => t.type.name),
        });
      }
      // Reset position and show next Pokemon
      position.setValue({ x: 0, y: 0 });
      setIsAnimating(false);
      moveToNext();
    });
  };

  /**
   * Handles swipe left (Dislike) action
   * - Triggers haptic feedback
   * - Animates card flying off to the left
   * - Moves to next Pokemon (without saving)
   */
  const swipeLeft = () => {
    if (isAnimating || !currentPokemon) return;
    setIsAnimating(true);

    // Lighter haptic feedback for dislike
    Vibration.vibrate(30);

    // Animate card flying off screen to the left
    Animated.timing(position, {
      toValue: { x: -width * 1.5, y: 50 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Reset position and show next Pokemon
      position.setValue({ x: 0, y: 0 });
      setIsAnimating(false);
      moveToNext();
    });
  };

  // Button press handlers (alternative to gestures)
  const handleLike = () => swipeRight();
  const handleDislike = () => swipeLeft();

  // ==================== NAVIGATION ====================
  
  /**
   * Navigates to the liked Pokemon collection screen
   */
  const handleViewLiked = () => {
    navigation.navigate('Liked');
  };

  /**
   * Navigates back to the welcome screen
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Retries fetching Pokemon after an error
   */
  const handleRetry = async () => {
    setIsInitialLoading(true);
    setError(null);
    const pokemon = await fetchPokemon();
    if (pokemon) {
      setCurrentPokemon(pokemon);
      addSeenPokemon(pokemon.id);
      prefetchNext();
    } else {
      setError('Failed to fetch Pokémon. Please try again.');
    }
    setIsInitialLoading(false);
  };

  // ==================== ANIMATED STYLES ====================
  
  /**
   * Animated style for the main Pokemon card
   * Includes translation, rotation, and will be applied via Animated.View
   */
  const cardAnimatedStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotation },
    ],
  };

  // ==================== OVERLAY OPACITY TRACKING ====================
  
  // State values to pass overlay opacity to PokemonCard component
  const [likeOpacityValue, setLikeOpacityValue] = useState(0);
  const [dislikeOpacityValue, setDislikeOpacityValue] = useState(0);

  /**
   * Listeners to track animated opacity values
   * Required to pass animated values to child components
   */
  useEffect(() => {
    const likeListener = likeOpacity.addListener(({ value }) => {
      setLikeOpacityValue(value);
    });
    const dislikeListener = dislikeOpacity.addListener(({ value }) => {
      setDislikeOpacityValue(value);
    });
    // Cleanup listeners on unmount
    return () => {
      likeOpacity.removeListener(likeListener);
      dislikeOpacity.removeListener(dislikeListener);
    };
  }, [likeOpacity, dislikeOpacity]);

  // ==================== RENDER ====================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header with back button and dark mode toggle */}
      <Header
        theme={theme}
        showBackButton
        onBackPress={handleBack}
        showDarkModeToggle
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <View style={styles.content}>
        {/* Loading State - Shown during initial fetch */}
        {isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Finding a Pokémon...
            </Text>
          </View>
        ) : error ? (
          /* Error State - Shown when API call fails */
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : currentPokemon ? (
          /* Main Content - Pokemon card with stacked effect */
          <View style={styles.cardsContainer}>
            {/* Stacked card placeholders - appear behind main card */}
            <View 
              style={[
                styles.stackedCard, 
                styles.backCard,
                { 
                  backgroundColor: isDarkMode ? '#0D1A30' : '#E0E0E0',
                  borderColor: isDarkMode ? '#1A2A45' : '#CCCCCC',
                }
              ]} 
            />
            <View 
              style={[
                styles.stackedCard, 
                styles.middleCard,
                { 
                  backgroundColor: isDarkMode ? '#121F38' : '#EBEBEB',
                  borderColor: isDarkMode ? '#1E3050' : '#D8D8D8',
                }
              ]} 
            />

            {/* Main Pokemon Card - Draggable with gestures */}
            <Animated.View 
              style={cardAnimatedStyle}
              {...panResponder.panHandlers}
            >
              <PokemonCard
                pokemon={currentPokemon}
                theme={theme}
                onLike={handleLike}
                onDislike={handleDislike}
                likeOpacity={likeOpacityValue}
                dislikeOpacity={dislikeOpacityValue}
              />
            </Animated.View>
          </View>
        ) : null}

        {/* Swipe Hint - Guides new users */}
        <View style={styles.swipeHint}>
          <Text style={[styles.swipeHintText, { color: theme.textSecondary }]}>
            ← Swipe or use buttons →
          </Text>
        </View>

        {/* Liked Pokemon Counter - Tappable to view collection */}
        <TouchableOpacity onPress={handleViewLiked} style={styles.likedCounter}>
          <Text style={[styles.likedCounterText, { color: theme.accent }]}>
            ♥ {likedPokemon.length} Pokémon liked
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/**
 * Styles for SwipeScreen
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
  },
  // Content area - centers cards
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Container for stacked cards effect
  cardsContainer: {
    width: CARD_WIDTH + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Base style for stacked placeholder cards
  stackedCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: 460,
    borderRadius: 24,
    borderWidth: 1,
  },
  // Back card (furthest behind) - smallest scale, most offset
  backCard: {
    transform: [{ translateY: 16 }, { scale: 0.92 }],
    opacity: 0.5,
  },
  // Middle card - medium scale and offset
  middleCard: {
    transform: [{ translateY: 8 }, { scale: 0.96 }],
    opacity: 0.7,
  },
  // Loading state container
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontStyle: 'italic',
  },
  // Error state container
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Swipe instruction hint
  swipeHint: {
    marginTop: 20,
  },
  swipeHintText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Liked Pokemon counter at bottom
  likedCounter: {
    position: 'absolute',
    bottom: 30,
    padding: 12,
  },
  likedCounterText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwipeScreen;
