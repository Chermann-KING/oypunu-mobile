/**
 * @fileoverview Cache Service Interface
 * Follows SOLID principles - Single Responsibility for in-memory caching
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  strategy?: 'LRU' | 'FIFO'; // Eviction strategy
}

/**
 * Cache service interface for temporary data storage
 * Optimizes performance by reducing API calls
 */
export interface ICacheService {
  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void;

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null;

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean;

  /**
   * Remove specific key from cache
   */
  delete(key: string): void;

  /**
   * Clear all cache entries
   */
  clear(): void;

  /**
   * Clear expired entries
   */
  clearExpired(): void;

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };

  /**
   * Get cache entry with metadata
   */
  getEntry<T>(key: string): CacheEntry<T> | null;

  /**
   * Set cache configuration
   */
  configure(config: CacheConfig): void;

  /**
   * Get all keys in cache
   */
  keys(): string[];
}

/**
 * Cache keys constants for dictionary app
 */
export const CACHE_KEYS = {
  SEARCH_RESULTS: 'search_results',
  WORD_DETAILS: 'word_details',
  CATEGORIES: 'categories',
  LANGUAGES: 'languages',
  USER_FAVORITES: 'user_favorites',
  COMMUNITIES: 'communities',
  RECENT_WORDS: 'recent_words',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];