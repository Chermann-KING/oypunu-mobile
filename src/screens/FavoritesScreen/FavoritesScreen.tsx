/**
 * @fileoverview Favorites Screen - Refactored with SOLID principles
 * Single Responsibility: Screen composition and navigation logic only
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../design-system/components';
import { Colors, Spacing } from '../../design-system';
import { useFavoritesAPI, useCollectionsAPI } from '../../core/hooks/useFavorites';
import { useFavoritesSync } from '../../core/hooks/useFavoritesSync';
import { useAuth } from '../../core/hooks/useAuth';
import { FavoriteWord } from '../../core/interfaces/IFavoritesService';
import {
  FavoritesHeader,
  CollectionFilters,
  FavoriteCard,
  FavoritesEmptyState,
  FavoritesLoadingState,
  SyncStatusIndicator,
} from './components';

export const FavoritesScreen: React.FC = () => {
  // État local - uniquement pour l'UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [currentFavorites, setCurrentFavorites] = useState<FavoriteWord[]>([]);

  // Hooks - délégation de la logique métier
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

  const {
    syncStatus,
    isManualSyncing,
    triggerManualSync,
    hasPendingActions,
  } = useFavoritesSync();

  // Initialisation
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
      loadCollections();
    }
  }, [isAuthenticated, loadFavorites, loadCollections]);

  // Filtrage des favoris
  useEffect(() => {
    if (searchQuery.trim()) {
      searchFavorites(searchQuery).then(setCurrentFavorites).catch(console.error);
    } else if (selectedCollectionId) {
      getFavoritesByCollection(selectedCollectionId).then(setCurrentFavorites).catch(console.error);
    } else {
      setCurrentFavorites(favorites);
    }
  }, [searchQuery, selectedCollectionId, favorites, searchFavorites, getFavoritesByCollection]);

  // Handlers - logique d'interaction pure
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedCollectionId(null);
  }, []);

  const handleCollectionSelect = useCallback((collectionId: string | null) => {
    setSelectedCollectionId(collectionId);
    setSearchQuery('');
  }, []);

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

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearCollection = useCallback(() => {
    setSelectedCollectionId(null);
  }, []);

  const handleRetry = useCallback(() => {
    loadFavorites();
  }, [loadFavorites]);

  const renderFavoriteCard = useCallback(({ item }: { item: FavoriteWord }) => (
    <FavoriteCard
      favorite={item}
      collections={collections}
      onRemove={handleRemoveFromFavorites}
    />
  ), [collections, handleRemoveFromFavorites]);

  // États de chargement et d'erreur
  const shouldShowLoadingState = !isAuthenticated || 
    (isLoadingFavorites && favorites.length === 0) || 
    favoritesError;

  if (shouldShowLoadingState) {
    return (
      <SafeAreaView style={styles.container}>
        <FavoritesHeader totalCount={0} />
        <FavoritesLoadingState
          isAuthenticated={isAuthenticated}
          isLoading={isLoadingFavorites && favorites.length === 0}
          error={favoritesError}
          onRetry={handleRetry}
        />
      </SafeAreaView>
    );
  }

  // État normal - composition des composants
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  return (
    <SafeAreaView style={styles.container}>
      <FavoritesHeader 
        totalCount={currentFavorites.length}
        hasSearchQuery={!!searchQuery.trim()}
        hasSelectedCollection={!!selectedCollectionId}
        selectedCollectionName={selectedCollection?.name}
      />
      
      <SearchBar
        placeholder="Rechercher dans les favoris..."
        onSearch={handleSearch}
      />

      <CollectionFilters
        collections={collections}
        selectedCollectionId={selectedCollectionId}
        onCollectionSelect={handleCollectionSelect}
      />

      <SyncStatusIndicator
        syncStatus={syncStatus}
        isManualSyncing={isManualSyncing}
        onManualSync={triggerManualSync}
      />

      <FlatList
        data={currentFavorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          currentFavorites.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={
          <FavoritesEmptyState
            searchQuery={searchQuery}
            selectedCollection={selectedCollection}
            onClearSearch={handleClearSearch}
            onClearCollection={handleClearCollection}
          />
        }
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
  listContainer: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});