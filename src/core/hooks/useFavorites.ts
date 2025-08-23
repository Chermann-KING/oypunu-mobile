/**
 * @fileoverview Favorites Hook
 * Follows SOLID principles - Interface Segregation for favorites operations
 */

import { useCallback } from 'react';
import { Word } from '../../types';
import { 
  FavoriteWord, 
  FavoriteCollection, 
  FavoritesStats 
} from '../interfaces/IFavoritesService';
import { 
  useFavorites as useFavoritesStore, 
  useCollections as useCollectionsStore, 
  useFavoritesStats as useFavoritesStatsStore,
  useFavoritesSync as useFavoritesSyncStore
} from '../stores/favoritesStore';
import { useServiceProvider } from '../providers/ServiceProvider';

/**
 * Main favorites hook
 * Provides high-level favorites operations
 */
export const useFavoritesAPI = () => {
  const serviceProvider = useServiceProvider();
  const favoritesService = serviceProvider.favoritesService;
  
  // Store hooks
  const favoritesStore = useFavoritesStore();
  const collectionsStore = useCollectionsStore();
  const syncStore = useFavoritesSyncStore();

  // ============ FAVORITES OPERATIONS ============

  const loadFavorites = useCallback(async () => {
    favoritesStore.setLoadingFavorites(true);
    favoritesStore.setFavoritesError(null);
    
    try {
      const favorites = await favoritesService.getFavorites();
      favoritesStore.setFavorites(favorites);
      return favorites;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement des favoris';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error loading favorites:', error);
      return [];
    } finally {
      favoritesStore.setLoadingFavorites(false);
    }
  }, [favoritesService, favoritesStore]);

  const addToFavorites = useCallback(async (word: Word, collectionId?: string) => {
    try {
      await favoritesService.addToFavorites(word.id, collectionId);
      
      // Update local state immediately for better UX
      favoritesStore.addFavorite(word, collectionId);
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout aux favoris';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error adding to favorites:', error);
      return false;
    }
  }, [favoritesService, favoritesStore, syncStore]);

  const removeFromFavorites = useCallback(async (wordId: string, collectionId?: string) => {
    try {
      await favoritesService.removeFromFavorites(wordId, collectionId);
      
      // Update local state immediately
      if (collectionId) {
        // Only remove from specific collection
        collectionsStore.removeWordFromCollection(wordId, collectionId);
      } else {
        // Remove from all favorites
        favoritesStore.removeFavorite(wordId);
      }
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression des favoris';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error removing from favorites:', error);
      return false;
    }
  }, [favoritesService, favoritesStore, syncStore]);

  const toggleFavorite = useCallback(async (word: Word) => {
    try {
      const newIsFavorite = await favoritesService.toggleFavorite(word);
      
      // Update local state
      favoritesStore.toggleFavorite(word);
      syncStore.markPendingChanges();
      
      return newIsFavorite;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du basculement des favoris';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error toggling favorite:', error);
      
      // Return current state if operation failed
      return favoritesStore.isFavorite(word.id);
    }
  }, [favoritesService, favoritesStore, syncStore]);

  const checkIsFavorite = useCallback(async (wordId: string) => {
    try {
      return await favoritesService.isFavorite(wordId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Fallback to local state
      return favoritesStore.isFavorite(wordId);
    }
  }, [favoritesService, favoritesStore]);

  const searchFavorites = useCallback(async (query: string) => {
    try {
      return await favoritesService.searchFavorites(query);
    } catch (error) {
      console.error('Error searching favorites:', error);
      // Fallback to local search
      return favoritesStore.searchFavorites(query);
    }
  }, [favoritesService, favoritesStore]);

  const addWordNotes = useCallback(async (wordId: string, notes: string) => {
    try {
      await favoritesService.addWordNotes(wordId, notes);
      
      // Update local state
      favoritesStore.updateFavoriteNotes(wordId, notes);
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout de notes';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error adding word notes:', error);
      return false;
    }
  }, [favoritesService, favoritesStore, syncStore]);

  const getWordNotes = useCallback(async (wordId: string) => {
    try {
      return await favoritesService.getWordNotes(wordId);
    } catch (error) {
      console.error('Error getting word notes:', error);
      // Fallback to local state
      const favorite = favoritesStore.favorites.find(fav => fav.id === wordId);
      return favorite?.notes || null;
    }
  }, [favoritesService, favoritesStore]);

  // ============ EXPORT FUNCTIONS ============

  const exportFavorites = useCallback(async (format: 'json' | 'csv' | 'txt') => {
    try {
      return await favoritesService.exportFavorites(format);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'exportation';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error exporting favorites:', error);
      throw error;
    }
  }, [favoritesService, favoritesStore]);

  const importFavorites = useCallback(async (data: string, format: 'json' | 'csv') => {
    try {
      const result = await favoritesService.importFavorites(data, format);
      
      // Reload favorites after successful import
      await loadFavorites();
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'importation';
      favoritesStore.setFavoritesError(errorMessage);
      console.error('Error importing favorites:', error);
      throw error;
    }
  }, [favoritesService, favoritesStore, loadFavorites]);

  // ============ RETURN ALL OPERATIONS ============

  return {
    // State
    ...favoritesStore,
    
    // Sync state
    lastSyncAt: syncStore.lastSyncAt,
    hasPendingChanges: syncStore.hasPendingChanges,
    
    // Operations
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    checkIsFavorite,
    searchFavorites,
    addWordNotes,
    getWordNotes,
    exportFavorites,
    importFavorites,
  };
};

/**
 * Collections management hook
 */
export const useCollectionsAPI = () => {
  const serviceProvider = useServiceProvider();
  const favoritesService = serviceProvider.favoritesService;
  
  // Store hooks
  const collectionsStore = useCollectionsStore();
  const syncStore = useFavoritesSyncStore();

  const loadCollections = useCallback(async () => {
    collectionsStore.setLoadingCollections(true);
    collectionsStore.setCollectionsError(null);
    
    try {
      const collections = await favoritesService.getCollections();
      collectionsStore.setCollections(collections);
      return collections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement des collections';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error loading collections:', error);
      return [];
    } finally {
      collectionsStore.setLoadingCollections(false);
    }
  }, [favoritesService, collectionsStore]);

  const createCollection = useCallback(async (data: Omit<FavoriteCollection, 'id' | 'createdAt' | 'updatedAt' | 'wordIds'>) => {
    try {
      const collection = await favoritesService.createCollection(data);
      
      // Update local state
      collectionsStore.addCollection(collection);
      syncStore.markPendingChanges();
      
      return collection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de création de collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error creating collection:', error);
      throw error;
    }
  }, [favoritesService, collectionsStore, syncStore]);

  const updateCollection = useCallback(async (id: string, data: Partial<Pick<FavoriteCollection, 'name' | 'description' | 'isPublic' | 'tags'>>) => {
    try {
      const collection = await favoritesService.updateCollection(id, data);
      
      // Update local state
      collectionsStore.updateCollection(id, collection);
      syncStore.markPendingChanges();
      
      return collection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour de collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error updating collection:', error);
      throw error;
    }
  }, [favoritesService, collectionsStore, syncStore]);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      await favoritesService.deleteCollection(id);
      
      // Update local state
      collectionsStore.removeCollection(id);
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de suppression de collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error deleting collection:', error);
      return false;
    }
  }, [favoritesService, collectionsStore, syncStore]);

  const addWordToCollection = useCallback(async (wordId: string, collectionId: string) => {
    try {
      await favoritesService.addWordToCollection(wordId, collectionId);
      
      // Update local state
      collectionsStore.addWordToCollection(wordId, collectionId);
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'ajout à la collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error adding word to collection:', error);
      return false;
    }
  }, [favoritesService, collectionsStore, syncStore]);

  const removeWordFromCollection = useCallback(async (wordId: string, collectionId: string) => {
    try {
      await favoritesService.removeWordFromCollection(wordId, collectionId);
      
      // Update local state
      collectionsStore.removeWordFromCollection(wordId, collectionId);
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de suppression de la collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error removing word from collection:', error);
      return false;
    }
  }, [favoritesService, collectionsStore, syncStore]);

  const moveWordToCollection = useCallback(async (wordId: string, fromCollectionId: string, toCollectionId: string) => {
    try {
      await favoritesService.moveWordToCollection(wordId, fromCollectionId, toCollectionId);
      
      // Update local state
      collectionsStore.removeWordFromCollection(wordId, fromCollectionId);
      collectionsStore.addWordToCollection(wordId, toCollectionId);
      syncStore.markPendingChanges();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de déplacement vers la collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error moving word to collection:', error);
      return false;
    }
  }, [favoritesService, collectionsStore, syncStore]);

  const getFavoritesByCollection = useCallback(async (collectionId: string) => {
    try {
      return await favoritesService.getFavoritesByCollection(collectionId);
    } catch (error) {
      console.error('Error getting favorites by collection:', error);
      // Fallback to local state
      return collectionsStore.getFavoritesByCollection(collectionId);
    }
  }, [favoritesService, collectionsStore]);

  const shareCollection = useCallback(async (collectionId: string, userIds: string[]) => {
    try {
      await favoritesService.shareCollection(collectionId, userIds);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de partage de collection';
      collectionsStore.setCollectionsError(errorMessage);
      console.error('Error sharing collection:', error);
      return false;
    }
  }, [favoritesService, collectionsStore]);

  const getSharedCollections = useCallback(async () => {
    try {
      return await favoritesService.getSharedCollections();
    } catch (error) {
      console.error('Error getting shared collections:', error);
      return [];
    }
  }, [favoritesService]);

  return {
    // State
    ...collectionsStore,
    
    // Operations
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addWordToCollection,
    removeWordFromCollection,
    moveWordToCollection,
    getFavoritesByCollection,
    shareCollection,
    getSharedCollections,
  };
};

/**
 * Favorites statistics hook
 */
export const useFavoritesStatsAPI = () => {
  const serviceProvider = useServiceProvider();
  const favoritesService = serviceProvider.favoritesService;
  
  // Store hooks
  const statsStore = useFavoritesStatsStore();

  const loadStats = useCallback(async () => {
    statsStore.setLoadingStats(true);
    
    try {
      const stats = await favoritesService.getFavoritesStats();
      statsStore.setStats(stats);
      return stats;
    } catch (error) {
      console.error('Error loading favorites stats:', error);
      return null;
    } finally {
      statsStore.setLoadingStats(false);
    }
  }, [favoritesService, statsStore]);

  return {
    ...statsStore,
    loadStats,
  };
};

/**
 * Favorites sync hook
 * Handles offline synchronization
 */
export const useFavoritesSyncAPI = () => {
  const serviceProvider = useServiceProvider();
  const favoritesService = serviceProvider.favoritesService;
  
  // Store hooks
  const syncStore = useFavoritesSyncStore();

  const syncFavorites = useCallback(async () => {
    try {
      const result = await favoritesService.syncFavorites();
      
      if (result.synchronized) {
        syncStore.setSyncStatus(new Date().toISOString(), false);
      }
      
      return result;
    } catch (error) {
      console.error('Error syncing favorites:', error);
      return { synchronized: false, conflicts: [] };
    }
  }, [favoritesService, syncStore]);

  return {
    ...syncStore,
    syncFavorites,
  };
};