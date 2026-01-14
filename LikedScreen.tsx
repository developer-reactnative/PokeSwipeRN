/**
 * LikedScreen Component
 * 
 * Displays the collection of all Pokemon the user has liked.
 * Shows Pokemon in a responsive grid layout.
 * 
 * FEATURES:
 * - Grid display of liked Pokemon (2 columns)
 * - Type-based color accents on cards
 * - Pokemon ID badges
 * - Empty state message when no Pokemon liked
 * - Total count in footer
 * - Dark mode support
 * 
 * NAVIGATION:
 * - Back button returns to previous screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePokemon } from '../context/PokemonContext';
import { lightTheme, darkTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import LikedPokemonCard from '../components/LikedPokemonCard';
import { LikedPokemon } from '../types/pokemon';

// Navigation type definitions
type RootStackParamList = {
  Welcome: undefined;
  Swipe: undefined;
  Liked: undefined;
};

type LikedScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Liked'>;
};

/**
 * LikedScreen Component
 * 
 * @param navigation - React Navigation prop for screen navigation
 */
const LikedScreen: React.FC<LikedScreenProps> = ({ navigation }) => {
  // Access global state from PokemonContext
  const { isDarkMode, toggleDarkMode, likedPokemon } = usePokemon();
  
  // Select theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;

  /**
   * Navigate back to previous screen
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Renders individual Pokemon card in the grid
   * 
   * @param item - LikedPokemon object containing Pokemon data
   */
  const renderPokemon = ({ item }: { item: LikedPokemon }) => (
    <LikedPokemonCard pokemon={item} theme={theme} />
  );

  /**
   * Renders empty state when user has no liked Pokemon
   * Displays a message encouraging them to start swiping
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Broken heart emoji for empty state */}
      <Text style={styles.emptyEmoji}>💔</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Pokémon Liked Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Start swiping to build your dream team!
      </Text>
    </View>
  );

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

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text }]}>
          Pokémon you have liked
        </Text>
        <Text style={styles.heartEmoji}>❤️</Text>
      </View>

      {/* Pokemon Grid - Uses FlatList for performance with large lists */}
      <FlatList
        data={likedPokemon}
        renderItem={renderPokemon}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}  // Two-column grid layout
        contentContainerStyle={[
          styles.listContainer,
          // Center empty state vertically
          likedPokemon.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer with total count - Only shown when Pokemon exist */}
      {likedPokemon.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.cardBorder }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Total: {likedPokemon.length} Pokémon in your collection
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

/**
 * Styles for LikedScreen
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
  },
  // Title section with heart emoji
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  heartEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  // Grid list container
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  // Makes empty state center vertically
  emptyListContainer: {
    flex: 1,
  },
  // Empty state container
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Footer with total count
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LikedScreen;
