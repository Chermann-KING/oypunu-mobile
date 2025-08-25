/**
 * @fileoverview Favorites Sync Service Implementation
 * Follows SOLID principles - Single Responsibility for favorites synchronization
 */

import { 
  IFavoritesSyncService, 
  PendingFavoriteAction, 
  FavoritesSyncStatus, 
  SyncResult 
} from '../interfaces/IFavoritesSyncService';
import { FavoriteWord } from '../interfaces/IFavoritesService';
import { IApiService } from '../interfaces/IApiService';
import { IStorageService } from '../interfaces/IStorageService';
import { ICacheService } from '../interfaces/ICacheService';

export class FavoritesSyncService implements IFavoritesSyncService {
  private readonly STORAGE_KEYS = {
    SYNC_QUEUE: 'favorites_sync_queue',
    LAST_SYNC: 'favorites_last_sync',
    SYNC_STATUS: 'favorites_sync_status',
  };

  private readonly SYNC_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000, // 1 second
    AUTO_SYNC_INTERVAL: 30000, // 30 seconds
    BATCH_SIZE: 10,
  };

  private autoSyncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor(
    private apiService: IApiService,
    private storageService: IStorageService,
    private cacheService: ICacheService
  ) {}

  // ============ QUEUE MANAGEMENT ============

  async addToQueue(action: Omit<PendingFavoriteAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queue = await this.getQueue();
    
    // Éviter les doublons - supprimer les actions existantes pour le même mot
    const filteredQueue = queue.filter(item => 
      !(item.wordId === action.wordId && item.type === action.type)
    );

    const newAction: PendingFavoriteAction = {
      id: `${action.type}_${action.wordId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      ...action,
    };

    filteredQueue.push(newAction);
    await this.saveQueue(filteredQueue);

    console.log(`[FavoritesSyncService] Added to queue: ${action.type} ${action.wordId}`);
  }

  async getQueueStatus(): Promise<FavoritesSyncStatus> {
    const queue = await this.getQueue();
    const lastSync = await this.storageService.getItem<string>(this.STORAGE_KEYS.LAST_SYNC);
    
    return {
      isOnline: await this.checkConnectivity(),
      isSyncing: this.isSyncing,
      hasPendingActions: queue.length > 0,
      lastSyncAt: lastSync,
      syncError: null, // TODO: Store last sync error
      pendingActionsCount: queue.length,
    };
  }

  async clearQueue(): Promise<void> {
    await this.storageService.removeItem(this.STORAGE_KEYS.SYNC_QUEUE);
    console.log('[FavoritesSyncService] Queue cleared');
  }

  // ============ SYNC OPERATIONS ============

  async syncPendingActions(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[FavoritesSyncService] Sync already in progress, skipping');
      return { success: false, syncedActions: 0, failedActions: 0, errors: ['Sync already in progress'] };
    }

    this.isSyncing = true;
    console.log('[FavoritesSyncService] Starting sync of pending actions');

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        console.log('[FavoritesSyncService] No pending actions to sync');
        return { success: true, syncedActions: 0, failedActions: 0, errors: [] };
      }

      const isOnline = await this.checkConnectivity();
      if (!isOnline) {
        console.log('[FavoritesSyncService] Offline, skipping sync');
        return { success: false, syncedActions: 0, failedActions: 0, errors: ['Offline'] };
      }

      let syncedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      const remainingActions: PendingFavoriteAction[] = [];

      // Traiter les actions par batches
      for (let i = 0; i < queue.length; i += this.SYNC_CONFIG.BATCH_SIZE) {
        const batch = queue.slice(i, i + this.SYNC_CONFIG.BATCH_SIZE);
        
        for (const action of batch) {
          try {
            await this.executeSyncAction(action);
            syncedCount++;
            console.log(`[FavoritesSyncService] Synced: ${action.type} ${action.wordId}`);
          } catch (error) {
            console.error(`[FavoritesSyncService] Failed to sync ${action.id}:`, error);
            
            // Incrementer retry count
            action.retryCount++;
            
            if (action.retryCount < action.maxRetries) {
              remainingActions.push(action);
            } else {
              failedCount++;
              errors.push(`${action.type} ${action.wordId}: Max retries exceeded`);
            }
          }
        }

        // Petit délai entre les batches pour éviter le rate limiting
        if (i + this.SYNC_CONFIG.BATCH_SIZE < queue.length) {
          await this.delay(500);
        }
      }

      // Sauvegarder les actions non synchronisées
      await this.saveQueue(remainingActions);
      
      // Marquer la dernière sync
      await this.storageService.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

      // Invalider le cache des favoris pour forcer un reload
      this.cacheService.delete('user-favorites');

      const result: SyncResult = {
        success: failedCount === 0,
        syncedActions: syncedCount,
        failedActions: failedCount,
        errors,
      };

      console.log(`[FavoritesSyncService] Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      return result;

    } finally {
      this.isSyncing = false;
    }
  }

  async forceSyncAll(): Promise<SyncResult> {
    console.log('[FavoritesSyncService] Starting force sync of all favorites');
    
    try {
      // Récupérer les favoris locaux et distants
      const localFavorites = await this.getLocalFavorites();
      const remoteFavorites = await this.getRemoteFavorites();

      // Résoudre les conflits
      const resolvedFavorites = await this.resolveFavoriteConflicts(localFavorites, remoteFavorites);

      // Sauvegarder les favoris résolus localement
      await this.storageService.setItem('favorites', JSON.stringify(resolvedFavorites));
      this.cacheService.set('user-favorites', resolvedFavorites, 600);

      // Synchroniser les actions en attente
      const syncResult = await this.syncPendingActions();

      return {
        ...syncResult,
        success: true,
      };
    } catch (error) {
      console.error('[FavoritesSyncService] Force sync failed:', error);
      return {
        success: false,
        syncedActions: 0,
        failedActions: 0,
        errors: [`Force sync failed: ${error}`],
      };
    }
  }

  // ============ STATUS AND MONITORING ============

  async getSyncStatus(): Promise<FavoritesSyncStatus> {
    return this.getQueueStatus();
  }

  startAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(async () => {
      try {
        await this.syncPendingActions();
      } catch (error) {
        console.error('[FavoritesSyncService] Auto-sync failed:', error);
      }
    }, this.SYNC_CONFIG.AUTO_SYNC_INTERVAL);

    console.log('[FavoritesSyncService] Auto-sync started');
  }

  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
    console.log('[FavoritesSyncService] Auto-sync stopped');
  }

  // ============ CONFLICT RESOLUTION ============

  async resolveFavoriteConflicts(
    localFavorites: FavoriteWord[], 
    remoteFavorites: FavoriteWord[]
  ): Promise<FavoriteWord[]> {
    // Stratégie: Remote wins pour simplifier
    // TODO: Implémenter une stratégie plus sophistiquée (merge, user choice, etc.)
    
    const resolvedFavorites: FavoriteWord[] = [...remoteFavorites];
    
    // Ajouter les favoris locaux qui ne sont pas présents à distance
    localFavorites.forEach(localFav => {
      const existsRemotely = remoteFavorites.some(remoteFav => remoteFav.id === localFav.id);
      if (!existsRemotely) {
        resolvedFavorites.push(localFav);
      }
    });

    console.log(`[FavoritesSyncService] Conflict resolution: ${resolvedFavorites.length} favorites resolved`);
    return resolvedFavorites;
  }

  // ============ PRIVATE HELPERS ============

  private async getQueue(): Promise<PendingFavoriteAction[]> {
    const queueData = await this.storageService.getItem<string>(this.STORAGE_KEYS.SYNC_QUEUE);
    if (!queueData) return [];
    
    try {
      return JSON.parse(queueData);
    } catch {
      return [];
    }
  }

  private async saveQueue(queue: PendingFavoriteAction[]): Promise<void> {
    await this.storageService.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  private async executeSyncAction(action: PendingFavoriteAction): Promise<void> {
    const endpoint = `/favorite-words/${encodeURIComponent(action.wordId)}`;
    
    if (action.type === 'add') {
      await this.apiService.post(endpoint);
    } else if (action.type === 'remove') {
      await this.apiService.delete(endpoint);
    } else {
      throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      // Ping simple pour vérifier la connectivité
      await this.apiService.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async getLocalFavorites(): Promise<FavoriteWord[]> {
    const localData = await this.storageService.getItem<string>('favorites');
    if (!localData) return [];
    
    try {
      return JSON.parse(localData);
    } catch {
      return [];
    }
  }

  private async getRemoteFavorites(): Promise<FavoriteWord[]> {
    try {
      const response = await this.apiService.get<{
        words: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/favorite-words');

      // Transformer selon le format attendu par le mobile
      return response.data.words.map(this.transformBackendWordToFavorite);
    } catch (error) {
      console.error('[FavoritesSyncService] Failed to fetch remote favorites:', error);
      return [];
    }
  }

  private transformBackendWordToFavorite(backend: any): FavoriteWord {
    const definition = backend?.meanings?.[0]?.definitions?.[0]?.definition || "Définition non disponible";
    const category = backend?.meanings?.[0]?.partOfSpeech || "Non spécifié";
    const author = typeof backend?.createdBy === "object" && backend?.createdBy?.username
        ? backend.createdBy.username
        : backend?.author || "Auteur inconnu";
    const language = typeof backend?.languageId === "object" && backend?.languageId?.name
        ? backend.languageId.name
        : backend?.languageId || backend?.language || "unknown";

    return {
      id: backend._id,
      word: backend.word,
      language,
      pronunciation: backend.pronunciation || "",
      definition,
      category,
      author,
      timeAgo: "Récemment",
      isFavorite: true,
      addedToFavoritesAt: backend.addedAt || backend.createdAt || new Date().toISOString(),
      collections: [],
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}