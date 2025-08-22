/**
 * @fileoverview In-Memory Cache Service Implementation
 * Follows SOLID principles - Single Responsibility for temporary caching
 * Implements ICacheService interface (DIP)
 */

import { ICacheService, CacheEntry, CacheConfig, CACHE_KEYS } from '../interfaces/ICacheService';

/**
 * Concrete implementation of ICacheService using Map
 * Follows SRP - Only responsible for in-memory caching
 */
export class CacheService implements ICacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private config: Required<CacheConfig>;
  private stats = {
    hits: 0,
    misses: 0,
  };
  private cleanupInterval?: any;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 300000, // 5 minutes default
      maxSize: config.maxSize || 1000, // 1000 entries default
      strategy: config.strategy || 'LRU', // LRU default
    };

    // Start cleanup interval every minute
    this.startCleanupInterval();
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.clearExpired();
    }, 60000); // Clean every minute
  }

  /**
   * Stop cleanup interval (for cleanup/testing)
   */
  public stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict oldest entry based on strategy
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return;

    if (this.config.strategy === 'LRU') {
      // Map preserves insertion order, first entry is the oldest accessed
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    } else if (this.config.strategy === 'FIFO') {
      // For FIFO, we also remove the first inserted (oldest)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Update access time for LRU strategy
   */
  private updateAccess<T>(key: string, entry: CacheEntry<T>): void {
    if (this.config.strategy === 'LRU') {
      // Remove and re-add to move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
  }

  /**
   * Log cache operations in development
   */
  private log(operation: string, key: string, data?: any): void {
    if (__DEV__) {
      console.log(`[Cache] ${operation}:`, key, data ? { data } : '');
    }
  }

  // ICacheService implementation

  set<T>(key: string, data: T, ttl?: number): void {
    // Check if we need to evict entries to make space
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const expirationTime = ttl || this.config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: expirationTime > 0 ? Date.now() + expirationTime : undefined,
    };

    this.cache.set(key, entry);
    this.log('SET', key, { ttl: expirationTime, size: this.cache.size });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.log('MISS', key);
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.log('EXPIRED', key);
      return null;
    }

    this.stats.hits++;
    this.updateAccess(key, entry);
    this.log('HIT', key);
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    const deleted = this.cache.delete(key);
    this.log('DELETE', key, { deleted });
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.log('CLEAR', 'all', { previousSize: size });
  }

  clearExpired(): void {
    let expiredCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.log('CLEAR_EXPIRED', 'cleanup', { expiredCount, remaining: this.cache.size });
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  getEntry<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  configure(config: CacheConfig): void {
    this.config = { ...this.config, ...config };
    this.log('CONFIGURE', 'settings', config);

    // If maxSize was reduced, evict excess entries
    while (this.cache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  keys(): string[] {
    // Filter out expired keys
    const validKeys: string[] = [];
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (!entry.expiresAt || now <= entry.expiresAt) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  // Additional utility methods

  /**
   * Get cache size in entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config };
  }

  /**
   * Check if cache is at capacity
   */
  isAtCapacity(): boolean {
    return this.cache.size >= this.config.maxSize;
  }

  /**
   * Get entries that will expire soon (within given milliseconds)
   */
  getExpiringSoon(withinMs: number = 60000): Array<{ key: string; expiresIn: number }> {
    const now = Date.now();
    const threshold = now + withinMs;
    const expiringSoon: Array<{ key: string; expiresIn: number }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt <= threshold && entry.expiresAt > now) {
        expiringSoon.push({
          key,
          expiresIn: entry.expiresAt - now,
        });
      }
    }

    return expiringSoon.sort((a, b) => a.expiresIn - b.expiresIn);
  }

  /**
   * Refresh TTL for existing entry
   */
  refreshTTL(key: string, newTtl?: number): boolean {
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      return false;
    }

    const ttl = newTtl || this.config.ttl;
    entry.expiresAt = ttl > 0 ? Date.now() + ttl : undefined;
    
    this.updateAccess(key, entry);
    this.log('REFRESH_TTL', key, { newTtl: ttl });
    return true;
  }

  /**
   * Cleanup method for proper service shutdown
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.clear();
  }
}

/**
 * Singleton instance for app-wide usage
 */
export const cacheService = new CacheService();