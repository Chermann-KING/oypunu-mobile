/**
 * @fileoverview AsyncStorage-based Storage Service Implementation
 * Follows SOLID principles - Single Responsibility for persistent storage
 * Implements IStorageService interface (DIP)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService, STORAGE_KEYS } from '../interfaces/IStorageService';

/**
 * Concrete implementation of IStorageService using AsyncStorage
 * Follows SRP - Only responsible for persistent data storage
 */
export class StorageService implements IStorageService {
  private enableLogging: boolean;

  constructor(enableLogging: boolean = __DEV__) {
    this.enableLogging = enableLogging;
  }

  /**
   * Log storage operations in development
   */
  private log(operation: string, key: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[Storage] ${operation}:`, key, data ? { data } : '');
    }
  }

  /**
   * Safely serialize data to JSON string
   */
  private serialize<T>(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('[Storage] Serialization error:', error);
      throw new Error(`Failed to serialize data for storage: ${error}`);
    }
  }

  /**
   * Safely deserialize JSON string to data
   */
  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('[Storage] Deserialization error:', error);
      throw new Error(`Failed to deserialize stored data: ${error}`);
    }
  }

  // IStorageService implementation

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = this.serialize(value);
      await AsyncStorage.setItem(key, serializedValue);
      this.log('SET', key, value);
    } catch (error) {
      console.error(`[Storage] Error setting item ${key}:`, error);
      throw new Error(`Failed to store item with key "${key}": ${error}`);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        this.log('GET', key, null);
        return null;
      }
      
      const deserializedValue = this.deserialize<T>(value);
      this.log('GET', key, deserializedValue);
      return deserializedValue;
    } catch (error) {
      console.error(`[Storage] Error getting item ${key}:`, error);
      // Return null instead of throwing to prevent app crashes
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      this.log('REMOVE', key);
    } catch (error) {
      console.error(`[Storage] Error removing item ${key}:`, error);
      throw new Error(`Failed to remove item with key "${key}": ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      this.log('CLEAR', 'all');
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      const exists = value !== null;
      this.log('HAS', key, exists);
      return exists;
    } catch (error) {
      console.error(`[Storage] Error checking item ${key}:`, error);
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      this.log('GET_ALL_KEYS', 'all', keys);
      return [...keys]; // Create mutable copy
    } catch (error) {
      console.error('[Storage] Error getting all keys:', error);
      throw new Error(`Failed to get all keys: ${error}`);
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      
      keyValuePairs.forEach(([key, value]) => {
        if (value === null) {
          result[key] = null;
        } else {
          try {
            result[key] = this.deserialize<T>(value);
          } catch (error) {
            console.error(`[Storage] Error deserializing item ${key}:`, error);
            result[key] = null;
          }
        }
      });

      this.log('GET_MULTIPLE', keys.join(', '), result);
      return result;
    } catch (error) {
      console.error('[Storage] Error getting multiple items:', error);
      throw new Error(`Failed to get multiple items: ${error}`);
    }
  }

  async setMultiple<T>(items: Record<string, T>): Promise<void> {
    try {
      const keyValuePairs: [string, string][] = Object.entries(items).map(([key, value]) => [
        key,
        this.serialize(value),
      ]);
      
      await AsyncStorage.multiSet(keyValuePairs);
      this.log('SET_MULTIPLE', Object.keys(items).join(', '), items);
    } catch (error) {
      console.error('[Storage] Error setting multiple items:', error);
      throw new Error(`Failed to set multiple items: ${error}`);
    }
  }

  // Utility methods for common app storage patterns

  /**
   * Store data with expiration timestamp
   */
  async setItemWithExpiry<T>(key: string, value: T, expirationMs: number): Promise<void> {
    const expirationTime = Date.now() + expirationMs;
    const dataWithExpiry = {
      data: value,
      expiresAt: expirationTime,
    };
    await this.setItem(key, dataWithExpiry);
  }

  /**
   * Get data and check if it's expired
   */
  async getItemWithExpiry<T>(key: string): Promise<T | null> {
    const item = await this.getItem<{ data: T; expiresAt: number }>(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      // Item expired, remove it
      await this.removeItem(key);
      return null;
    }

    return item.data;
  }

  /**
   * Remove expired items (cleanup utility)
   */
  async removeExpiredItems(): Promise<number> {
    try {
      const allKeys = await this.getAllKeys();
      let removedCount = 0;

      // Check each key for expiration data
      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            // Check if it has expiration structure and is expired
            if (parsed && typeof parsed === 'object' && 
                'expiresAt' in parsed && 
                typeof parsed.expiresAt === 'number' &&
                Date.now() > parsed.expiresAt) {
              await this.removeItem(key);
              removedCount++;
            }
          }
        } catch (error) {
          // Skip items that can't be parsed or checked
          continue;
        }
      }

      this.log('CLEANUP', 'expired items', { removedCount });
      return removedCount;
    } catch (error) {
      console.error('[Storage] Error during cleanup:', error);
      return 0;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number; // In bytes
    keys: string[];
  }> {
    try {
      const keys = await this.getAllKeys();
      let estimatedSize = 0;

      // Estimate size by getting all items
      const items = await AsyncStorage.multiGet(keys);
      items.forEach(([key, value]) => {
        estimatedSize += key.length + (value?.length || 0);
      });

      return {
        totalKeys: keys.length,
        estimatedSize,
        keys,
      };
    } catch (error) {
      console.error('[Storage] Error getting storage info:', error);
      return {
        totalKeys: 0,
        estimatedSize: 0,
        keys: [],
      };
    }
  }
}

/**
 * Singleton instance for app-wide usage
 */
export const storageService = new StorageService();