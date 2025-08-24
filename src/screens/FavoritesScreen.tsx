import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Search, Trash2, Plus, Folder, User } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../design-system';
import { SearchBar, Card, Button } from '../design-system/components';
import { useFavoritesAPI, useCollectionsAPI } from '../core/hooks/useFavorites';
import { useAuth } from '../core/hooks/useAuth';
import { FavoriteWord } from '../core/interfaces/IFavoritesService';

export const FavoritesScreen: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Hooks
  const { isAuthenticated } = useAuth();
  const {
    favorites,
    isLoadingFavorites,
    favoritesError,
    loadFavorites,
    removeFromFavorites,
    searchFavorites,
  } = useFavoritesAPI();

  const {
    collections,
    isLoadingCollections,
    loadCollections,
    getFavoritesByCollection,
  } = useCollectionsAPI();

  // Current favorites to display
  const [currentFavorites, setCurrentFavorites] = useState<FavoriteWord[]>([]);

  // Initialize screen
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
      loadCollections();
    }
  }, [isAuthenticated, loadFavorites, loadCollections]);

  // Update current favorites based on filters
  useEffect(() => {
    if (searchQuery.trim()) {
      // Show search results
      searchFavorites(searchQuery).then(setCurrentFavorites).catch(console.error);
    } else if (selectedCollection) {
      // Show collection favorites
      getFavoritesByCollection(selectedCollection).then(setCurrentFavorites).catch(console.error);
    } else {
      // Show all favorites
      setCurrentFavorites(favorites);
    }
  }, [searchQuery, selectedCollection, favorites, searchFavorites, getFavoritesByCollection]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedCollection(null); // Clear collection filter when searching
  }, []);

  // Handle collection filter
  const handleCollectionFilter = useCallback((collectionId: string | null) => {
    setSelectedCollection(collectionId);
    setSearchQuery(''); // Clear search when filtering by collection
  }, []);

  // Handle remove from favorites
  const handleRemoveFromFavorites = useCallback(async (favorite: FavoriteWord) => {
    Alert.alert(
      'Supprimer des favoris',
      `Voulez-vous supprimer "${favorite.word}" de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeFromFavorites(favorite.id);
              if (success) {
                Alert.alert('Succès', `"${favorite.word}" a été supprimé de vos favoris.`);
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le favori. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  }, [removeFromFavorites]);

  // Render favorite card
  const renderFavoriteCard = useCallback(({ item }: { item: FavoriteWord }) => (
    <Card variant="default" padding={4}>
      <View style={styles.favoriteHeader}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle}>{item.word}</Text>
          <Text style={styles.favoriteLanguage}>{item.language}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleRemoveFromFavorites(item)}
          style={styles.removeButton}
        >
          <Trash2 size={18} color={Colors.semantic.error} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.favoritePronunciation}>/{item.pronunciation}/</Text>
      <Text style={styles.favoriteDefinition}>{item.definition}</Text>
      
      <View style={styles.favoriteFooter}>
        <Text style={styles.favoriteCategory}>{item.category}</Text>
        {item.notes && (
          <Text style={styles.favoriteNotes} numberOfLines={1}>{item.notes}</Text>
        )}
        <Text style={styles.favoriteDate}>
          Ajouté le {new Date(item.addedToFavoritesAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {item.collections.length > 0 && (
        <View style={styles.favoriteCollections}>
          {item.collections.map((collectionId, index) => {
            const collection = collections.find(c => c.id === collectionId);
            return (
              <Text key={collectionId} style={styles.collectionTag}>
                {collection?.name || 'Collection inconnue'}
                {index < item.collections.length - 1 ? ', ' : ''}
              </Text>
            );
          })}
        </View>
      )}
    </Card>
  ), [handleRemoveFromFavorites, collections]);

  // Render collection filter
  const renderCollectionFilter = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Collections :</Text>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !selectedCollection && styles.filterButtonActive
          ]}
          onPress={() => handleCollectionFilter(null)}
        >
          <Text style={[
            styles.filterButtonText,
            !selectedCollection && styles.filterButtonTextActive
          ]}>
            Toutes
          </Text>
        </TouchableOpacity>
        
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={[
              styles.filterButton,
              selectedCollection === collection.id && styles.filterButtonActive
            ]}
            onPress={() => handleCollectionFilter(collection.id)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCollection === collection.id && styles.filterButtonTextActive
            ]}>
              {collection.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Search size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptySubtitle}>
            Aucun favori trouvé pour "{searchQuery}"
          </Text>
          <Button
            title="Effacer la recherche"
            onPress={() => setSearchQuery('')}
            variant="secondary"
          />
        </View>
      );
    }

    if (selectedCollection) {
      const collection = collections.find(c => c.id === selectedCollection);
      return (
        <View style={styles.emptyContainer}>
          <Folder size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Collection vide</Text>
          <Text style={styles.emptySubtitle}>
            Aucun mot dans la collection "{collection?.name}"
          </Text>
          <Button
            title="Voir tous les favoris"
            onPress={() => setSelectedCollection(null)}
            variant="secondary"
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Heart size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyTitle}>Aucun favori</Text>
        <Text style={styles.emptySubtitle}>
          Vous n'avez pas encore de mots favoris.{'\n'}
          Parcourez le dictionnaire et ajoutez vos mots préférés !
        </Text>
      </View>
    );
  };

  // Render login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <User size={64} color={Colors.text.secondary} />
          <Text style={styles.loginTitle}>Connectez-vous</Text>
          <Text style={styles.loginSubtitle}>
            Connectez-vous pour accéder à vos favoris et collections
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoadingFavorites && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes Favoris</Text>
        </View>
        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Favoris</Text>
        <Text style={styles.subtitle}>
          {currentFavorites.length} mot{currentFavorites.length !== 1 ? 's' : ''}
          {searchQuery.trim() && ' trouvé(s)'}
          {selectedCollection && ` dans ${collections.find(c => c.id === selectedCollection)?.name}`}
        </Text>
      </View>
      
      <SearchBar
        placeholder="Rechercher dans les favoris..."
        onSearch={handleSearch}
      />

      {/* Collection filters */}
      {collections.length > 0 && !searchQuery.trim() && renderCollectionFilter()}

      {/* Error state */}
      {favoritesError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{favoritesError}</Text>
          <Button
            title="Réessayer"
            onPress={() => loadFavorites()}
            variant="primary"
          />
        </View>
      )}

      {/* Favorites list */}
      <FlatList
        data={currentFavorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          currentFavorites.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={isLoadingFavorites}
        onRefresh={loadFavorites}
      />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  loginTitle: {
    ...Typography.styles.headingLarge,
    textAlign: 'center',
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
  },
  loginSubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
    lineHeight: 24,
  },
  loadingText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[4],
  },
  filtersContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[300],
  },
  filtersTitle: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  filterButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 16,
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.primary[300],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterButtonText: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: Colors.text.onPrimary,
  },
  errorContainer: {
    padding: Spacing[4],
    alignItems: 'center',
  },
  errorText: {
    ...Typography.styles.bodyMedium,
    color: Colors.semantic.error,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  listContainer: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
  },
  emptyTitle: {
    ...Typography.styles.headingMedium,
    color: Colors.text.primary,
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  emptySubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
    lineHeight: 24,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  favoriteLanguage: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
  },
  removeButton: {
    padding: Spacing[2],
    marginRight: -Spacing[2],
  },
  favoritePronunciation: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing[2],
  },
  favoriteDefinition: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[3],
  },
  favoriteFooter: {
    marginBottom: Spacing[2],
  },
  favoriteCategory: {
    ...Typography.styles.caption,
    color: Colors.interactive.focus,
    backgroundColor: Colors.surface.elevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: Spacing[2],
  },
  favoriteNotes: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing[1],
  },
  favoriteDate: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  favoriteCollections: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing[2],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.primary[300],
  },
  collectionTag: {
    ...Typography.styles.caption,
    color: Colors.semantic.info,
  },
});