import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, Plus, AlertCircle, RefreshCcw } from "lucide-react-native";
import { Colors, Spacing, Typography } from "../design-system";
import { SearchBar, Card, Button } from "../design-system/components";
import { Word } from "../types";
import { useDictionary } from "../core/hooks/useDictionary";
import { useFavoritesAPI } from "../core/hooks/useFavorites";
import { useLanguageMapping } from "../core/hooks/useLanguageMapping";
import { WordDetailsScreen } from "./WordDetailsScreen";
import AddWordScreen from "./AddWordScreen";

export const DictionaryScreen: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [wordNavigationStack, setWordNavigationStack] = useState<string[]>([]);
  const [isAddingWord, setIsAddingWord] = useState(false);

  // Hooks
  const {
    searchResults,
    searchQuery: currentSearchQuery,
    isSearching,
    searchError,
    hasMoreResults,
    recentWords,
    popularWords,
    setSearchQuery: setCurrentSearchQuery,
    searchWords,
    loadMoreResults,
    loadRecentWords,
    loadPopularWords,
    clearSearch,
  } = useDictionary();

  const { toggleFavorite, isFavorite, isLoadingFavorites } = useFavoritesAPI();

  // Language mapping hook for displaying language names instead of codes
  const { getLanguageName, formatLanguageDisplay } = useLanguageMapping();

  // Current words to display
  const currentWords = searchQuery.trim()
    ? searchResults
    : recentWords.length > 0
    ? recentWords
    : popularWords;

  // Initialize screen
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Load initial data
        await Promise.all([loadRecentWords(20), loadPopularWords(10)]);
      } catch (error) {
        console.error("Error initializing dictionary screen:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeScreen();
  }, []); // Empty dependency array - only run once on mount

  // Handle search with debouncing
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setCurrentSearchQuery(query);

      if (query.trim() === "") {
        clearSearch();
        return;
      }

      if (query.length < 2) {
        // Don't search for single characters
        return;
      }

      try {
        await searchWords({
          query,
          limit: 20,
          sortBy: "relevance",
        });
      } catch (error) {
        console.error("Search error:", error);
      }
    },
    [searchWords, clearSearch, setCurrentSearchQuery]
  );

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(
    async (word: Word) => {
      try {
        const newIsFavorite = await toggleFavorite(word);

        // Show feedback
        Alert.alert(
          newIsFavorite ? "Ajouté aux favoris" : "Retiré des favoris",
          `"${word.word}" ${
            newIsFavorite ? "a été ajouté à" : "a été retiré de"
          } vos favoris.`,
          [{ text: "OK" }]
        );
      } catch (error) {
        Alert.alert(
          "Erreur",
          "Impossible de modifier vos favoris. Veuillez réessayer.",
          [{ text: "OK" }]
        );
      }
    },
    [toggleFavorite]
  );

  // Handle word card press (navigate to details)
  const handleWordPress = useCallback((word: Word) => {
    console.log("🔥 NAVIGATING TO WORD DETAILS:", word.word, "ID:", word.id);
    setWordNavigationStack([word.id]);
  }, []);

  // Handle navigation to another word from word details (for synonyms, antonyms, etc.)
  const handleNavigateToWord = useCallback((wordId: string) => {
    console.log("🔗 NAVIGATING TO RELATED WORD ID:", wordId);
    setWordNavigationStack((prevStack) => [...prevStack, wordId]);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (!hasMoreResults || isSearching || !searchQuery.trim()) {
      return;
    }

    try {
      await loadMoreResults(
        {
          query: searchQuery,
          limit: 20,
          sortBy: "relevance",
        },
        searchResults
      );
    } catch (error) {
      console.error("Load more error:", error);
    }
  }, [
    hasMoreResults,
    isSearching,
    searchQuery,
    loadMoreResults,
    searchResults,
  ]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      // Reload initial data
      Promise.all([loadRecentWords(20), loadPopularWords(10)]);
    }
  }, [searchQuery, handleSearch, loadRecentWords, loadPopularWords]);

  // Render word card
  const renderWordCard = useCallback(
    ({ item }: { item: Word }) => (
      <Card variant="default" padding={4} onPress={() => handleWordPress(item)}>
        <View style={styles.wordHeader}>
          <View style={styles.wordInfo}>
            <Text style={styles.wordTitle}>{item.word}</Text>
            <Text style={styles.language}>
              {formatLanguageDisplay(item.language, { showFlag: true })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              handleFavoriteToggle(item);
            }}
            disabled={isLoadingFavorites}
            style={styles.favoriteButton}
          >
            {isLoadingFavorites ? (
              <ActivityIndicator size="small" color={Colors.text.tertiary} />
            ) : (
              <Heart
                size={20}
                color={
                  isFavorite(item.id)
                    ? Colors.semantic.error
                    : Colors.text.tertiary
                }
                fill={
                  isFavorite(item.id) ? Colors.semantic.error : "transparent"
                }
              />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.pronunciation}>/{item.pronunciation}/</Text>
        <Text style={styles.definition}>{item.definition}</Text>

        <View style={styles.wordFooter}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.author}>
            Par {item.author} • {item.timeAgo}
          </Text>
        </View>
      </Card>
    ),
    [
      handleFavoriteToggle,
      isLoadingFavorites,
      isFavorite,
      handleWordPress,
      formatLanguageDisplay,
    ]
  );

  // Render list footer
  const renderListFooter = useCallback(() => {
    if (!hasMoreResults || !searchQuery.trim()) {
      return null;
    }

    return (
      <View style={styles.loadMoreContainer}>
        {isSearching ? (
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        ) : (
          <Button
            title="Charger plus"
            onPress={handleLoadMore}
            variant="secondary"
          />
        )}
      </View>
    );
  }, [hasMoreResults, searchQuery, isSearching, handleLoadMore]);

  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptySubtitle}>
            Aucun mot trouvé pour "{searchQuery}"
          </Text>
          <Button
            title="Effacer la recherche"
            onPress={() => {
              setSearchQuery("");
              clearSearch();
            }}
            variant="secondary"
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Dictionnaire vide</Text>
        <Text style={styles.emptySubtitle}>
          Aucun mot disponible pour le moment
        </Text>
        <Button title="Réessayer" onPress={handleRetry} variant="primary" />
      </View>
    );
  };

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertCircle size={48} color={Colors.semantic.error} />
      <Text style={styles.errorTitle}>Erreur de chargement</Text>
      <Text style={styles.errorMessage}>{searchError}</Text>
      <Button
        title="Réessayer"
        onPress={handleRetry}
        variant="primary"
        icon={<RefreshCcw size={16} color={Colors.text.onPrimary} />}
      />
    </View>
  );

  // Handle back from word details
  const handleBackFromDetails = useCallback(() => {
    setWordNavigationStack((prevStack) => {
      const newStack = [...prevStack];
      newStack.pop(); // Remove current word from stack
      return newStack;
    });
  }, []);

  const handleOpenAddWord = useCallback(() => {
    setIsAddingWord(true);
  }, []);

  const handleCloseAddWord = useCallback(() => {
    setIsAddingWord(false);
  }, []);

  // Show word details screen if there's a word in the navigation stack
  const currentWordId = wordNavigationStack[wordNavigationStack.length - 1];
  if (currentWordId) {
    return (
      <WordDetailsScreen
        wordId={currentWordId}
        onBack={handleBackFromDetails}
        onNavigateToWord={handleNavigateToWord}
      />
    );
  }

  if (isAddingWord) {
    return <AddWordScreen onBack={handleCloseAddWord} />;
  }

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dictionnaire</Text>
        </View>

        <SearchBar
          placeholder="Rechercher un mot..."
          onSearch={handleSearch}
          loading={isSearching}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Chargement du dictionnaire...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dictionnaire</Text>
        {!searchQuery.trim() && (
          <Text style={styles.subtitle}>
            {recentWords.length > 0 ? "Mots récents" : "Mots populaires"}
          </Text>
        )}
      </View>

      <SearchBar
        placeholder="Rechercher un mot..."
        onSearch={handleSearch}
        loading={isSearching}
      />

      {/* Show search results count */}
      {searchQuery.trim() && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {isSearching
              ? "Recherche..."
              : `${searchResults.length} résultat${
                  searchResults.length !== 1 ? "s" : ""
                }`}
          </Text>
        </View>
      )}

      {/* Show error state */}
      {searchError && renderErrorState()}

      {/* Show main content */}
      {!searchError && (
        <FlatList
          data={currentWords}
          renderItem={renderWordCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            currentWords.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          refreshing={isSearching && currentWords.length === 0}
        />
      )}

      {/* Add word FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAddWord}>
        <Plus size={24} color={Colors.text.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  title: {
    ...Typography.styles.headingLarge,
  },
  subtitle: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  resultsHeader: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[300],
  },
  resultsCount: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
  },
  listContainer: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[20],
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[6],
  },
  loadingText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[4],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[6],
  },
  errorTitle: {
    ...Typography.styles.headingMedium,
    color: Colors.text.primary,
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  errorMessage: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing[6],
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing[8],
  },
  emptyTitle: {
    ...Typography.styles.headingMedium,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  emptySubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing[6],
  },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: Spacing[4],
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing[2],
  },
  wordInfo: {
    flex: 1,
  },
  wordTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  language: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
  },
  favoriteButton: {
    padding: Spacing[2],
    marginRight: -Spacing[2],
  },
  pronunciation: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontStyle: "italic",
    marginBottom: Spacing[2],
  },
  definition: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[3],
  },
  wordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    ...Typography.styles.caption,
    color: Colors.interactive.focus,
    backgroundColor: Colors.surface.elevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
  },
  author: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  fab: {
    position: "absolute",
    bottom: Spacing[6],
    right: Spacing[4],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
