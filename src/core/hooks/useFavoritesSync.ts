/**
 * @fileoverview Favorites Sync Hook
 * Follows SOLID principles - Interface Segregation for sync operations
 */

import { useState, useEffect, useCallback } from 'react';
import { FavoritesSyncStatus, SyncResult } from '../interfaces/IFavoritesSyncService';
import { useServiceProvider } from '../providers/ServiceProvider';

/**
 * Hook for favorites synchronization status and operations
 */
export const useFavoritesSync = () => {
  const serviceProvider = useServiceProvider();
  const favoritesService = serviceProvider.favoritesService;
  
  const [syncStatus, setSyncStatus] = useState<FavoritesSyncStatus | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Load sync status
  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await favoritesService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('[useFavoritesSync] Failed to load sync status:', error);
    }
  }, [favoritesService]);

  // Manual sync trigger
  const triggerManualSync = useCallback(async () => {
    if (isManualSyncing) return null;
    
    setIsManualSyncing(true);
    try {
      const result = await favoritesService.syncPendingActions();
      setLastSyncResult(result);
      await loadSyncStatus(); // Refresh status
      return result;
    } catch (error) {
      console.error('[useFavoritesSync] Manual sync failed:', error);
      return null;
    } finally {
      setIsManualSyncing(false);
    }
  }, [favoritesService, isManualSyncing, loadSyncStatus]);

  // Force full sync
  const triggerForceSync = useCallback(async () => {
    if (isManualSyncing) return null;
    
    setIsManualSyncing(true);
    try {
      const result = await favoritesService.forceSyncAll();
      setLastSyncResult(result);
      await loadSyncStatus(); // Refresh status
      return result;
    } catch (error) {
      console.error('[useFavoritesSync] Force sync failed:', error);
      return null;
    } finally {
      setIsManualSyncing(false);
    }
  }, [favoritesService, isManualSyncing, loadSyncStatus]);

  // Initialize and refresh sync status periodically
  useEffect(() => {
    loadSyncStatus();
    
    // Refresh status every 10 seconds
    const interval = setInterval(loadSyncStatus, 10000);
    
    return () => clearInterval(interval);
  }, [loadSyncStatus]);

  return {
    // Status
    syncStatus,
    isManualSyncing,
    lastSyncResult,
    
    // Actions
    loadSyncStatus,
    triggerManualSync,
    triggerForceSync,
    
    // Computed status
    hasPendingActions: syncStatus?.hasPendingActions || false,
    isOnline: syncStatus?.isOnline || false,
    isSyncing: syncStatus?.isSyncing || isManualSyncing,
    lastSyncAt: syncStatus?.lastSyncAt,
    syncError: syncStatus?.syncError,
  };
};