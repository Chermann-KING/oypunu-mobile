/**
 * @fileoverview Storage Service Interface
 * Follows SOLID principles - Single Responsibility for data persistence
 */

/**
 * Storage service interface for persistent data
 * Abstracts AsyncStorage implementation (DIP)
 */
export interface IStorageService {
  /**
   * Store a value with a key
   */
  setItem<T>(key: string, value: T): Promise<void>;

  /**
   * Retrieve a value by key
   */
  getItem<T>(key: string): Promise<T | null>;

  /**
   * Remove an item by key
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all stored data
   */
  clear(): Promise<void>;

  /**
   * Check if a key exists
   */
  hasItem(key: string): Promise<boolean>;

  /**
   * Get all stored keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get multiple items by keys
   */
  getMultiple<T>(keys: string[]): Promise<Record<string, T | null>>;

  /**
   * Set multiple items at once
   */
  setMultiple<T>(items: Record<string, T>): Promise<void>;
}

/**
 * Storage keys constants to avoid magic strings
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  FAVORITES: 'favorites',
  SEARCH_HISTORY: 'search_history',
  USER_PREFERENCES: 'user_preferences',
  CACHE_DICTIONARY: 'cache_dictionary',
  OFFLINE_QUEUE: 'offline_queue',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];