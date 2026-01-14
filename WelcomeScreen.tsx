/**
 * WelcomeScreen Component
 * 
 * The landing page of PokeSwipe application that introduces users to the app.
 * 
 * FEATURES:
 * - Displays app instructions in a styled card
 * - "Let's Go!" button to start swiping
 * - Dark mode toggle in header
 * - Link to view previously liked Pokemon (if any)
 * 
 * NAVIGATION:
 * - Navigates to SwipeScreen when "Let's Go!" is pressed
 * - Navigates to LikedScreen when liked Pokemon link is pressed
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePokemon } from '../context/PokemonContext';
import { lightTheme, darkTheme } from '../context/ThemeContext';
import Header from '../components/Header';

// Get device screen width for responsive card sizing
const { width } = Dimensions.get('window');
// Card width is responsive but capped at 340px for larger screens
const CARD_WIDTH = Math.min(width - 40, 340);

// Type definitions for navigation
type RootStackParamList = {
  Welcome: undefined;
  Swipe: undefined;
  Liked: undefined;
};

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

/**
 * WelcomeScreen Component
 * 
 * @param navigation - React Navigation prop for screen navigation
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  // Access global state from PokemonContext
  const { isDarkMode, toggleDarkMode, likedPokemon } = usePokemon();
  
  // Select theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;

  /**
   * Navigate to the main swipe screen
   */
  const handleStart = () => {
    navigation.navigate('Swipe');
  };

  /**
   * Navigate to the liked Pokemon collection screen
   */
  const handleViewLiked = () => {
    navigation.navigate('Liked');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Set status bar style based on theme */}
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header with PokeAPI logo and dark mode toggle */}
      <Header
        theme={theme}
        showDarkModeToggle
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <View style={styles.content}>
        {/* Welcome Card - Contains instructions and start button */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Decorative heart icon in top-right corner */}
          <View style={styles.heartContainer}>
            <Text style={styles.heartIcon}>♥</Text>
          </View>

          {/* Card Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            How to Play PokeSwipe
          </Text>

          {/* Instructions List - Explains app functionality */}
          <View style={styles.instructionsList}>
            <Text style={[styles.instruction, { color: theme.textSecondary }]}>
              Pokémon Appear One at a Time
            </Text>
            <Text style={[styles.instruction, { color: theme.textSecondary }]}>
              Choose "Like" or "Dislike"
            </Text>
            <Text style={[styles.instruction, { color: theme.textSecondary }]}>
              Build Your Favorite Team
            </Text>
          </View>

          {/* Start Button - Navigates to swipe screen */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Let's Go!</Text>
          </TouchableOpacity>
        </View>

        {/* Link to view liked Pokemon - Only shown if user has liked some */}
        {likedPokemon.length > 0 && (
          <TouchableOpacity onPress={handleViewLiked} style={styles.likedLink}>
            <Text style={[styles.likedLinkText, { color: theme.accent }]}>
              View your {likedPokemon.length} liked Pokémon ♥
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

/**
 * Styles for WelcomeScreen
 * 
 * Uses StyleSheet.create for performance optimization
 */
const styles = StyleSheet.create({
  // Main container - fills entire screen
  container: {
    flex: 1,
  },
  // Content wrapper - centers the card vertically and horizontally
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Main welcome card styling
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    // Shadow for Android
    elevation: 8,
    borderWidth: 1,
  },
  // Heart icon container - positioned in top-right corner
  heartContainer: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Heart icon styling
  heartIcon: {
    fontSize: 16,
    color: '#FF6B9D',
  },
  // Card title styling
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 30,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Instructions list container
  instructionsList: {
    width: '100%',
    marginBottom: 28,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  // Individual instruction text styling
  instruction: {
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'left',
  },
  // Start button styling
  startButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    // Green glow effect
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // Start button text
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  // Link to view liked Pokemon
  likedLink: {
    marginTop: 24,
    padding: 12,
  },
  // Liked link text styling
  likedLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
