/**
 * @fileoverview Favorites Service Implementation
 * Follows SOLID principles - Single Responsibility for favorites API operations
 */

import { Word } from '../../types';
import { 
  IFavoritesService,
  FavoriteWord,
  FavoriteCollection,
  FavoritesStats
} from '../interfaces/IFavoritesService';
import { IApiService } from '../interfaces/IApiService';
import { ICacheService } from '../interfaces/ICacheService';
import { IStorageService } from '../interfaces/IStorageService';

/**
 * Concrete Favorites Service
 * Handles all favorites-related API operations with offline support
 */
export class FavoritesService implements IFavoritesService {
  private readonly CACHE_TTL = {
    FAVORITES: 600, // 10 minutes
    COLLECTIONS: 1800, // 30 minutes
    STATS: 900, // 15 minutes
  };

  constructor(
    private apiService: IApiService,
    private cacheService: ICacheService,
    private storageService: IStorageService
  ) {}

  // ============ FAVORITES METHODS ============

  /**
   * Get all user's favorite words
   */
  async getFavorites(): Promise<FavoriteWord[]> {
    const cacheKey = 'user-favorites';
    const cached = await this.cacheService.get<FavoriteWord[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.apiService.get<{ data: FavoriteWord[] }>('/favorites');
      const favorites = response.data.data;
      
      // Cache favorites
      this.cacheService.set(cacheKey, favorites, this.CACHE_TTL.FAVORITES);
      
      // Store locally for offline access
      await this.storageService.setItem('favorites', JSON.stringify(favorites));
      
      return favorites;
    } catch (error) {
      // Fallback to local storage if API fails
      const localFavorites = await this.storageService.getItem<string>('favorites');
      if (localFavorites) {
        return JSON.parse(localFavorites);
      }
      throw error;
    }
  }

  /**
   * Add word to favorites
   */
  async addToFavorites(wordId: string, collectionId?: string): Promise<void> {
    const payload: { wordId: string; collectionId?: string } = { wordId };
    if (collectionId) {
      payload.collectionId = collectionId;
    }

    await this.apiService.post('/favorites', payload);
    
    // Invalidate cache
    this.cacheService.delete('user-favorites');
    this.cacheService.delete('favorites-stats');
    
    if (collectionId) {
      this.cacheService.delete(`collection-${collectionId}-favorites`);
    }
  }

  /**
   * Remove word from favorites
   */
  async removeFromFavorites(wordId: string, collectionId?: string): Promise<void> {
    const params = collectionId ? `?collectionId=${collectionId}` : '';
    
    await this.apiService.delete(`/favorites/${wordId}${params}`);
    
    // Invalidate cache
    this.cacheService.delete('user-favorites');
    this.cacheService.delete('favorites-stats');
    
    if (collectionId) {
      this.cacheService.delete(`collection-${collectionId}-favorites`);
    }
  }

  /**
   * Check if word is in favorites
   */
  async isFavorite(wordId: string): Promise<boolean> {
    try {
      const response = await this.apiService.get<{ isFavorite: boolean }>(`/favorites/check/${wordId}`);
      return response.data.isFavorite;
    } catch (error) {
      // Fallback to local check
      const localFavorites = await this.storageService.getItem<string>('favorites');
      if (localFavorites) {
        const favorites: FavoriteWord[] = JSON.parse(localFavorites);
        return favorites.some(fav => fav.id === wordId);
      }
      return false;
    }
  }

  /**
   * Toggle favorite status of a word
   */
  async toggleFavorite(word: Word): Promise<boolean> {
    const isCurrentlyFavorite = await this.isFavorite(word.id);
    
    if (isCurrentlyFavorite) {
      await this.removeFromFavorites(word.id);
      return false;
    } else {
      await this.addToFavorites(word.id);
      return true;
    }
  }

  /**
   * Get favorites by collection
   */
  async getFavoritesByCollection(collectionId: string): Promise<FavoriteWord[]> {
    const cacheKey = `collection-${collectionId}-favorites`;
    const cached = await this.cacheService.get<FavoriteWord[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ data: FavoriteWord[] }>(`/collections/${collectionId}/favorites`);
    const favorites = response.data.data;
    
    // Cache collection favorites
    this.cacheService.set(cacheKey, favorites, this.CACHE_TTL.FAVORITES);
    
    return favorites;
  }

  /**
   * Search within favorites
   */
  async searchFavorites(query: string): Promise<FavoriteWord[]> {
    const params = new URLSearchParams();
    params.append('q', query);

    const response = await this.apiService.get<{ data: FavoriteWord[] }>(`/favorites/search?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get favorites statistics
   */
  async getFavoritesStats(): Promise<FavoritesStats> {
    const cacheKey = 'favorites-stats';
    const cached = await this.cacheService.get<FavoritesStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<FavoritesStats>('/favorites/stats');
    const stats = response.data;
    
    // Cache stats
    this.cacheService.set(cacheKey, stats, this.CACHE_TTL.STATS);
    
    return stats;
  }

  // ============ COLLECTIONS METHODS ============

  /**
   * Get all user's collections
   */
  async getCollections(): Promise<FavoriteCollection[]> {
    const cacheKey = 'user-collections';
    const cached = await this.cacheService.get<FavoriteCollection[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.apiService.get<{ data: FavoriteCollection[] }>('/collections');
      const collections = response.data.data;
      
      // Cache collections
      this.cacheService.set(cacheKey, collections, this.CACHE_TTL.COLLECTIONS);
      
      // Store locally for offline access
      await this.storageService.setItem('collections', JSON.stringify(collections));
      
      return collections;
    } catch (error) {
      // Fallback to local storage
      const localCollections = await this.storageService.getItem<string>('collections');
      if (localCollections) {
        return JSON.parse(localCollections);
      }
      throw error;
    }
  }

  /**
   * Create new collection
   */
  async createCollection(data: Omit<FavoriteCollection, 'id' | 'createdAt' | 'updatedAt' | 'wordIds'>): Promise<FavoriteCollection> {
    const response = await this.apiService.post<FavoriteCollection>('/collections', data);
    const collection = response.data;
    
    // Invalidate cache
    this.cacheService.delete('user-collections');
    
    return collection;
  }

  /**
   * Update collection
   */
  async updateCollection(id: string, data: Partial<Pick<FavoriteCollection, 'name' | 'description' | 'isPublic' | 'tags'>>): Promise<FavoriteCollection> {
    const response = await this.apiService.put<FavoriteCollection>(`/collections/${id}`, data);
    const collection = response.data;
    
    // Invalidate cache
    this.cacheService.delete('user-collections');
    this.cacheService.delete(`collection-${id}-favorites`);
    
    return collection;
  }

  /**
   * Delete collection
   */
  async deleteCollection(id: string): Promise<void> {
    await this.apiService.delete(`/collections/${id}`);
    
    // Invalidate cache
    this.cacheService.delete('user-collections');
    this.cacheService.delete(`collection-${id}-favorites`);
    this.cacheService.delete('user-favorites'); // Favorites structure might change
  }

  /**
   * Add word to specific collection
   */
  async addWordToCollection(wordId: string, collectionId: string): Promise<void> {
    await this.apiService.post(`/collections/${collectionId}/words`, { wordId });
    
    // Invalidate cache
    this.cacheService.delete(`collection-${collectionId}-favorites`);
    this.cacheService.delete('user-favorites');
  }

  /**
   * Remove word from specific collection
   */
  async removeWordFromCollection(wordId: string, collectionId: string): Promise<void> {
    await this.apiService.delete(`/collections/${collectionId}/words/${wordId}`);
    
    // Invalidate cache
    this.cacheService.delete(`collection-${collectionId}-favorites`);
    this.cacheService.delete('user-favorites');
  }

  /**
   * Move word between collections
   */
  async moveWordToCollection(wordId: string, fromCollectionId: string, toCollectionId: string): Promise<void> {
    await this.apiService.post(`/collections/move-word`, {
      wordId,
      fromCollectionId,
      toCollectionId,
    });
    
    // Invalidate cache
    this.cacheService.delete(`collection-${fromCollectionId}-favorites`);
    this.cacheService.delete(`collection-${toCollectionId}-favorites`);
    this.cacheService.delete('user-favorites');
  }

  // ============ ADVANCED FEATURES ============

  /**
   * Export favorites data
   */
  async exportFavorites(format: 'json' | 'csv' | 'txt'): Promise<string> {
    const response = await this.apiService.get<{ data: string }>(`/favorites/export?format=${format}`);
    return response.data.data;
  }

  /**
   * Import favorites data
   */
  async importFavorites(data: string, format: 'json' | 'csv'): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const response = await this.apiService.post<{
      imported: number;
      skipped: number;
      errors: string[];
    }>('/favorites/import', { data, format });
    
    // Invalidate cache after import
    this.cacheService.delete('user-favorites');
    this.cacheService.delete('user-collections');
    this.cacheService.delete('favorites-stats');
    
    return response.data;
  }

  /**
   * Share collection with other users
   */
  async shareCollection(collectionId: string, userIds: string[]): Promise<void> {
    await this.apiService.post(`/collections/${collectionId}/share`, { userIds });
  }

  /**
   * Get shared collections from other users
   */
  async getSharedCollections(): Promise<FavoriteCollection[]> {
    const cacheKey = 'shared-collections';
    const cached = await this.cacheService.get<FavoriteCollection[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ data: FavoriteCollection[] }>('/collections/shared');
    const collections = response.data.data;
    
    // Cache shared collections
    this.cacheService.set(cacheKey, collections, this.CACHE_TTL.COLLECTIONS);
    
    return collections;
  }

  /**
   * Add personal notes to a favorite word
   */
  async addWordNotes(wordId: string, notes: string): Promise<void> {
    await this.apiService.put(`/favorites/${wordId}/notes`, { notes });
    
    // Invalidate cache
    this.cacheService.delete('user-favorites');
    
    // Clear any collection caches that might contain this word
    this.clearWordRelatedCaches(wordId);
  }

  /**
   * Get word notes
   */
  async getWordNotes(wordId: string): Promise<string | null> {
    try {
      const response = await this.apiService.get<{ notes: string | null }>(`/favorites/${wordId}/notes`);
      return response.data.notes;
    } catch (error) {
      // Fallback to local favorites
      const localFavorites = await this.storageService.getItem<string>('favorites');
      if (localFavorites) {
        const favorites: FavoriteWord[] = JSON.parse(localFavorites);
        const favorite = favorites.find(fav => fav.id === wordId);
        return favorite?.notes || null;
      }
      return null;
    }
  }

  /**
   * Sync favorites with server (for offline support)
   */
  async syncFavorites(): Promise<{ synchronized: boolean; conflicts: FavoriteWord[] }> {
    try {
      // Get local pending changes
      const localFavorites = await this.storageService.getItem<string>('favorites');
      const localCollections = await this.storageService.getItem<string>('collections');
      const lastSyncAt = await this.storageService.getItem<string>('lastFavoritesSync');
      
      const payload = {
        favorites: localFavorites ? JSON.parse(localFavorites) : [],
        collections: localCollections ? JSON.parse(localCollections) : [],
        lastSyncAt: lastSyncAt || null,
      };

      const response = await this.apiService.post<{
        synchronized: boolean;
        conflicts: FavoriteWord[];
        serverData: {
          favorites: FavoriteWord[];
          collections: FavoriteCollection[];
        };
      }>('/favorites/sync', payload);

      const { synchronized, conflicts, serverData } = response.data;
      
      if (synchronized) {
        // Update local storage with server data
        await this.storageService.setItem('favorites', JSON.stringify(serverData.favorites));
        await this.storageService.setItem('collections', JSON.stringify(serverData.collections));
        await this.storageService.setItem('lastFavoritesSync', new Date().toISOString());
        
        // Clear all caches to force refresh
        this.clearAllFavoritesCaches();
      }
      
      return { synchronized, conflicts };
    } catch (error) {
      console.error('Sync failed:', error);
      return { synchronized: false, conflicts: [] };
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Clear all favorites-related caches
   */
  private clearAllFavoritesCaches(): void {
    const keys = this.cacheService.keys();
    keys.forEach(key => {
      if (key.startsWith('user-favorites') || 
          key.startsWith('user-collections') ||
          key.startsWith('collection-') ||
          key.startsWith('favorites-stats') ||
          key.startsWith('shared-collections')) {
        this.cacheService.delete(key);
      }
    });
  }

  /**
   * Clear caches related to a specific word
   */
  private clearWordRelatedCaches(wordId: string): void {
    const keys = this.cacheService.keys();
    keys.forEach(key => {
      // Clear collection caches that might contain this word
      if (key.startsWith('collection-') && key.endsWith('-favorites')) {
        this.cacheService.delete(key);
      }
    });
  }

  /**
   * Get offline-capable cache key with user context
   */
  private getUserCacheKey(baseKey: string): string {
    // In a real app, you'd include user ID or similar
    // For now, we'll use a simple prefix
    return `user:${baseKey}`;
  }
}