/**
 * @fileoverview Favorites Store
 * Follows SOLID principles - Single Responsibility for favorites state
 * Separated from dictionary store (SRP)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../../types';
import { FavoriteWord, FavoriteCollection, FavoritesStats } from '../interfaces/IFavoritesService';
import { STORAGE_KEYS } from '../interfaces/IStorageService';

/**
 * Favorites state interface
 * Follows ISP - Only favorites-related state
 */
export interface FavoritesState {
  // Favorites data
  favorites: FavoriteWord[];
  favoriteIds: Set<string>;
  collections: FavoriteCollection[];
  stats: FavoritesStats | null;
  
  // Loading states
  isLoadingFavorites: boolean;
  isLoadingCollections: boolean;
  isLoadingStats: boolean;
  
  // Error states
  favoritesError: string | null;
  collectionsError: string | null;
  
  // Sync state
  lastSyncAt: string | null;
  hasPendingChanges: boolean;
  
  // Favorites actions
  setFavorites: (favorites: FavoriteWord[]) => void;
  addFavorite: (word: Word, collectionId?: string) => void;
  removeFavorite: (wordId: string) => void;
  toggleFavorite: (word: Word) => boolean;
  updateFavoriteNotes: (wordId: string, notes: string) => void;
  
  // Collections actions
  setCollections: (collections: FavoriteCollection[]) => void;
  addCollection: (collection: FavoriteCollection) => void;
  updateCollection: (id: string, updates: Partial<FavoriteCollection>) => void;
  removeCollection: (id: string) => void;
  addWordToCollection: (wordId: string, collectionId: string) => void;
  removeWordFromCollection: (wordId: string, collectionId: string) => void;
  
  // Stats actions
  setStats: (stats: FavoritesStats) => void;
  
  // Loading actions
  setLoadingFavorites: (loading: boolean) => void;
  setLoadingCollections: (loading: boolean) => void;
  setLoadingStats: (loading: boolean) => void;
  
  // Error actions
  setFavoritesError: (error: string | null) => void;
  setCollectionsError: (error: string | null) => void;
  
  // Sync actions
  setSyncStatus: (lastSyncAt: string | null, hasPendingChanges: boolean) => void;
  markPendingChanges: () => void;
  
  // Utility actions
  clearAll: () => void;
  clearErrors: () => void;
  
  // Getters
  isFavorite: (wordId: string) => boolean;
  getFavoritesByCollection: (collectionId: string) => FavoriteWord[];
  getFavoritesByLanguage: (language: string) => FavoriteWord[];
  getFavoritesByCategory: (category: string) => FavoriteWord[];
  searchFavorites: (query: string) => FavoriteWord[];
  getCollectionById: (id: string) => FavoriteCollection | undefined;
}

/**
 * Initial state
 */
const initialState = {
  favorites: [],
  favoriteIds: new Set<string>(),
  collections: [],
  stats: null,
  isLoadingFavorites: false,
  isLoadingCollections: false,
  isLoadingStats: false,
  favoritesError: null,
  collectionsError: null,
  lastSyncAt: null,
  hasPendingChanges: false,
};

/**
 * Favorites store implementation
 * Follows SRP - Only manages favorites-related state
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Favorites actions
      setFavorites: (favorites) => {
        const favoriteIds = new Set(favorites.map(fav => fav.id));
        set({ favorites, favoriteIds });
      },
      
      addFavorite: (word, collectionId) => {
        const currentFavorites = get().favorites;
        const isAlreadyFavorite = currentFavorites.some(fav => fav.id === word.id);
        
        if (!isAlreadyFavorite) {
          const favoriteWord: FavoriteWord = {
            ...word,
            addedToFavoritesAt: new Date().toISOString(),
            collections: collectionId ? [collectionId] : [],
            isFavorite: true,
          };
          
          const newFavorites = [...currentFavorites, favoriteWord];
          const newFavoriteIds = new Set([...get().favoriteIds, word.id]);
          
          set({ 
            favorites: newFavorites, 
            favoriteIds: newFavoriteIds,
            hasPendingChanges: true,
          });
        } else if (collectionId) {
          // Add to collection if word is already favorite
          get().addWordToCollection(word.id, collectionId);
        }
      },
      
      removeFavorite: (wordId) => {
        const currentFavorites = get().favorites;
        const newFavorites = currentFavorites.filter(fav => fav.id !== wordId);
        const newFavoriteIds = new Set(get().favoriteIds);
        newFavoriteIds.delete(wordId);
        
        set({ 
          favorites: newFavorites, 
          favoriteIds: newFavoriteIds,
          hasPendingChanges: true,
        });
      },
      
      toggleFavorite: (word) => {
        const isFavorite = get().isFavorite(word.id);
        
        if (isFavorite) {
          get().removeFavorite(word.id);
          return false;
        } else {
          get().addFavorite(word);
          return true;
        }
      },
      
      updateFavoriteNotes: (wordId, notes) => {
        const currentFavorites = get().favorites;
        const updatedFavorites = currentFavorites.map(fav => 
          fav.id === wordId ? { ...fav, notes } : fav
        );
        
        set({ 
          favorites: updatedFavorites,
          hasPendingChanges: true,
        });
      },

      // Collections actions
      setCollections: (collections) => set({ collections }),
      
      addCollection: (collection) => {
        const currentCollections = get().collections;
        set({ 
          collections: [...currentCollections, collection],
          hasPendingChanges: true,
        });
      },
      
      updateCollection: (id, updates) => {
        const currentCollections = get().collections;
        const updatedCollections = currentCollections.map(collection =>
          collection.id === id 
            ? { ...collection, ...updates, updatedAt: new Date().toISOString() }
            : collection
        );
        
        set({ 
          collections: updatedCollections,
          hasPendingChanges: true,
        });
      },
      
      removeCollection: (id) => {
        const currentCollections = get().collections;
        const currentFavorites = get().favorites;
        
        // Remove collection and remove it from all favorites
        const updatedCollections = currentCollections.filter(collection => collection.id !== id);
        const updatedFavorites = currentFavorites.map(favorite => ({
          ...favorite,
          collections: favorite.collections.filter(collectionId => collectionId !== id),
        }));
        
        set({ 
          collections: updatedCollections,
          favorites: updatedFavorites,
          hasPendingChanges: true,
        });
      },
      
      addWordToCollection: (wordId, collectionId) => {
        const currentFavorites = get().favorites;
        const updatedFavorites = currentFavorites.map(favorite =>
          favorite.id === wordId && !favorite.collections.includes(collectionId)
            ? { ...favorite, collections: [...favorite.collections, collectionId] }
            : favorite
        );
        
        set({ 
          favorites: updatedFavorites,
          hasPendingChanges: true,
        });
      },
      
      removeWordFromCollection: (wordId, collectionId) => {
        const currentFavorites = get().favorites;
        const updatedFavorites = currentFavorites.map(favorite =>
          favorite.id === wordId
            ? { ...favorite, collections: favorite.collections.filter(id => id !== collectionId) }
            : favorite
        );
        
        set({ 
          favorites: updatedFavorites,
          hasPendingChanges: true,
        });
      },

      // Stats actions
      setStats: (stats) => set({ stats }),

      // Loading actions
      setLoadingFavorites: (isLoadingFavorites) => set({ isLoadingFavorites }),
      setLoadingCollections: (isLoadingCollections) => set({ isLoadingCollections }),
      setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),

      // Error actions
      setFavoritesError: (favoritesError) => set({ favoritesError }),
      setCollectionsError: (collectionsError) => set({ collectionsError }),

      // Sync actions
      setSyncStatus: (lastSyncAt, hasPendingChanges) => set({ lastSyncAt, hasPendingChanges }),
      markPendingChanges: () => set({ hasPendingChanges: true }),

      // Utility actions
      clearAll: () => set(initialState),
      clearErrors: () => set({ favoritesError: null, collectionsError: null }),

      // Getters
      isFavorite: (wordId) => get().favoriteIds.has(wordId),
      
      getFavoritesByCollection: (collectionId) => {
        return get().favorites.filter(favorite => 
          favorite.collections.includes(collectionId)
        );
      },
      
      getFavoritesByLanguage: (language) => {
        return get().favorites.filter(favorite => 
          favorite.language.toLowerCase() === language.toLowerCase()
        );
      },
      
      getFavoritesByCategory: (category) => {
        return get().favorites.filter(favorite => 
          favorite.category.toLowerCase() === category.toLowerCase()
        );
      },
      
      searchFavorites: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().favorites.filter(favorite =>
          favorite.word.toLowerCase().includes(lowerQuery) ||
          favorite.definition.toLowerCase().includes(lowerQuery) ||
          favorite.language.toLowerCase().includes(lowerQuery) ||
          favorite.category.toLowerCase().includes(lowerQuery) ||
          (favorite.notes && favorite.notes.toLowerCase().includes(lowerQuery))
        );
      },
      
      getCollectionById: (id) => {
        return get().collections.find(collection => collection.id === id);
      },
    }),
    {
      name: STORAGE_KEYS.FAVORITES,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all favorites data for offline access
      partialize: (state) => ({
        favorites: state.favorites,
        favoriteIds: Array.from(state.favoriteIds), // Convert Set to Array for serialization
        collections: state.collections,
        lastSyncAt: state.lastSyncAt,
        hasPendingChanges: state.hasPendingChanges,
      }),
      // Handle Set serialization/deserialization
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.favoriteIds)) {
          state.favoriteIds = new Set(state.favoriteIds);
        }
      },
      version: 1,
    }
  )
);

/**
 * Specialized hooks for different aspects of favorites state
 */

export const useFavorites = () => {
  const {
    favorites,
    isLoadingFavorites,
    favoritesError,
    setFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    updateFavoriteNotes,
    setLoadingFavorites,
    setFavoritesError,
    isFavorite,
    getFavoritesByLanguage,
    getFavoritesByCategory,
    searchFavorites,
  } = useFavoritesStore();
  
  return {
    favorites,
    isLoadingFavorites,
    favoritesError,
    setFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    updateFavoriteNotes,
    setLoadingFavorites,
    setFavoritesError,
    isFavorite,
    getFavoritesByLanguage,
    getFavoritesByCategory,
    searchFavorites,
  };
};

export const useCollections = () => {
  const {
    collections,
    isLoadingCollections,
    collectionsError,
    setCollections,
    addCollection,
    updateCollection,
    removeCollection,
    addWordToCollection,
    removeWordFromCollection,
    setLoadingCollections,
    setCollectionsError,
    getFavoritesByCollection,
    getCollectionById,
  } = useFavoritesStore();
  
  return {
    collections,
    isLoadingCollections,
    collectionsError,
    setCollections,
    addCollection,
    updateCollection,
    removeCollection,
    addWordToCollection,
    removeWordFromCollection,
    setLoadingCollections,
    setCollectionsError,
    getFavoritesByCollection,
    getCollectionById,
  };
};

export const useFavoritesStats = () => {
  const {
    stats,
    isLoadingStats,
    setStats,
    setLoadingStats,
  } = useFavoritesStore();
  
  return {
    stats,
    isLoadingStats,
    setStats,
    setLoadingStats,
  };
};

export const useFavoritesSync = () => {
  const {
    lastSyncAt,
    hasPendingChanges,
    setSyncStatus,
    markPendingChanges,
  } = useFavoritesStore();
  
  return {
    lastSyncAt,
    hasPendingChanges,
    setSyncStatus,
    markPendingChanges,
  };
};