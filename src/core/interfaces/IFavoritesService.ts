/**
 * @fileoverview Favorites Service Interface
 * Follows SOLID principles - Single Responsibility for favorites management
 */

import { Word } from '../../types';

export interface FavoriteCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  wordIds: string[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface FavoriteWord extends Word {
  addedToFavoritesAt: string;
  collections: string[]; // Collection IDs this word belongs to
  notes?: string; // User's personal notes about this word
}

export interface FavoritesStats {
  totalFavorites: number;
  collectionsCount: number;
  languageBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  recentlyAdded: FavoriteWord[];
}

/**
 * Favorites service interface
 * Handles user's favorite words and collections
 */
export interface IFavoritesService {
  /**
   * Get all user's favorite words
   */
  getFavorites(): Promise<FavoriteWord[]>;

  /**
   * Add word to favorites
   */
  addToFavorites(wordId: string, collectionId?: string): Promise<void>;

  /**
   * Remove word from favorites
   */
  removeFromFavorites(wordId: string, collectionId?: string): Promise<void>;

  /**
   * Check if word is in favorites
   */
  isFavorite(wordId: string): Promise<boolean>;

  /**
   * Toggle favorite status of a word
   */
  toggleFavorite(word: Word): Promise<boolean>;

  /**
   * Get favorites by collection
   */
  getFavoritesByCollection(collectionId: string): Promise<FavoriteWord[]>;

  /**
   * Search within favorites
   */
  searchFavorites(query: string): Promise<FavoriteWord[]>;

  /**
   * Get favorites statistics
   */
  getFavoritesStats(): Promise<FavoritesStats>;

  // Collection management

  /**
   * Get all user's collections
   */
  getCollections(): Promise<FavoriteCollection[]>;

  /**
   * Create new collection
   */
  createCollection(data: Omit<FavoriteCollection, 'id' | 'createdAt' | 'updatedAt' | 'wordIds'>): Promise<FavoriteCollection>;

  /**
   * Update collection
   */
  updateCollection(id: string, data: Partial<Pick<FavoriteCollection, 'name' | 'description' | 'isPublic' | 'tags'>>): Promise<FavoriteCollection>;

  /**
   * Delete collection
   */
  deleteCollection(id: string): Promise<void>;

  /**
   * Add word to specific collection
   */
  addWordToCollection(wordId: string, collectionId: string): Promise<void>;

  /**
   * Remove word from specific collection
   */
  removeWordFromCollection(wordId: string, collectionId: string): Promise<void>;

  /**
   * Move word between collections
   */
  moveWordToCollection(wordId: string, fromCollectionId: string, toCollectionId: string): Promise<void>;

  // Advanced features

  /**
   * Export favorites data
   */
  exportFavorites(format: 'json' | 'csv' | 'txt'): Promise<string>;

  /**
   * Import favorites data
   */
  importFavorites(data: string, format: 'json' | 'csv'): Promise<{ imported: number; skipped: number; errors: string[] }>;

  /**
   * Share collection with other users
   */
  shareCollection(collectionId: string, userIds: string[]): Promise<void>;

  /**
   * Get shared collections from other users
   */
  getSharedCollections(): Promise<FavoriteCollection[]>;

  /**
   * Add personal notes to a favorite word
   */
  addWordNotes(wordId: string, notes: string): Promise<void>;

  /**
   * Get word notes
   */
  getWordNotes(wordId: string): Promise<string | null>;

  /**
   * Sync favorites with server (for offline support)
   */
  syncFavorites(): Promise<{ synchronized: boolean; conflicts: FavoriteWord[] }>;
}