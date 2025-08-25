/**
 * @fileoverview Favorites Sync Service Interface
 * Follows SOLID principles - Interface Segregation for sync operations
 */

import { FavoriteWord } from './IFavoritesService';

export interface PendingFavoriteAction {
  id: string;
  type: 'add' | 'remove';
  wordId: string;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

export interface FavoritesSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingActions: boolean;
  lastSyncAt: string | null;
  syncError: string | null;
  pendingActionsCount: number;
}

export interface SyncResult {
  success: boolean;
  syncedActions: number;
  failedActions: number;
  errors: string[];
}

export interface IFavoritesSyncService {
  // Queue management
  addToQueue(action: Omit<PendingFavoriteAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void>;
  getQueueStatus(): Promise<FavoritesSyncStatus>;
  clearQueue(): Promise<void>;
  
  // Sync operations
  syncPendingActions(): Promise<SyncResult>;
  forceSyncAll(): Promise<SyncResult>;
  
  // Status and monitoring
  getSyncStatus(): Promise<FavoritesSyncStatus>;
  startAutoSync(): void;
  stopAutoSync(): void;
  
  // Conflict resolution
  resolveFavoriteConflicts(localFavorites: FavoriteWord[], remoteFavorites: FavoriteWord[]): Promise<FavoriteWord[]>;
}