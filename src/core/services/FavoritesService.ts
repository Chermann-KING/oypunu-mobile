/**
 * @fileoverview Favorites Service Implementation
 * Follows SOLID principles - Single Responsibility for favorites API operations
 * Enhanced with robust synchronization via FavoritesSyncService
 */

import { Word } from "../../types";
import {
  IFavoritesService,
  FavoriteWord,
  FavoriteCollection,
  FavoritesStats,
} from "../interfaces/IFavoritesService";
import { IApiService } from "../interfaces/IApiService";
import { ICacheService } from "../interfaces/ICacheService";
import { IStorageService } from "../interfaces/IStorageService";
import { IFavoritesSyncService } from "../interfaces/IFavoritesSyncService";

/**
 * Concrete Favorites Service
 * Handles all favorites-related API operations with robust offline support
 * Uses FavoritesSyncService for reliable synchronization
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
    private storageService: IStorageService,
    private syncService: IFavoritesSyncService
  ) {
    // Démarrer la synchronisation automatique
    this.syncService.startAutoSync();
  }

  // Helper: transforme un document Word backend en FavoriteWord (plat)
  private transformBackendWordToFavorite(backend: any): FavoriteWord {
    const definition =
      backend?.meanings?.[0]?.definitions?.[0]?.definition ||
      "Définition non disponible";
    const category = backend?.meanings?.[0]?.partOfSpeech || "Non spécifié";
    const author =
      typeof backend?.createdBy === "object" && backend?.createdBy?.username
        ? backend.createdBy.username
        : backend?.author || "Auteur inconnu";
    const language =
      typeof backend?.languageId === "object" && backend?.languageId?.name
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
      addedToFavoritesAt:
        backend.addedAt || backend.createdAt || new Date().toISOString(),
      collections: [],
    };
  }

  // ============ FAVORITES METHODS ============

  /**
   * Get all user's favorite words
   */
  async getFavorites(): Promise<FavoriteWord[]> {
    const cacheKey = "user-favorites";
    const cached = await this.cacheService.get<FavoriteWord[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // ✅ Structure réelle du backend : { words, total, page, limit, totalPages }
      // Backend: GET /favorite-words (auth required)
      const response = await this.apiService.get<{
        words: any[]; // BackendWord[]
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>("/favorite-words");

      // Transformer les mots backend en FavoriteWord plat
      const favorites: FavoriteWord[] = response.data.words.map((word) =>
        this.transformBackendWordToFavorite(word)
      );

      // Cache favorites
      this.cacheService.set(cacheKey, favorites, this.CACHE_TTL.FAVORITES);

      // Store locally for offline access
      await this.storageService.setItem("favorites", JSON.stringify(favorites));

      return favorites;
    } catch (error) {
      console.error("[FavoritesService] Error loading favorites:", error);
      // Fallback to local storage if API fails
      const localFavorites = await this.storageService.getItem<string>(
        "favorites"
      );
      if (localFavorites) {
        return JSON.parse(localFavorites);
      }
      throw error;
    }
  }

  /**
   * Add word to favorites with robust synchronization
   */
  async addToFavorites(wordId: string, collectionId?: string): Promise<void> {
    try {
      // Essayer d'abord l'API directement
      await this.apiService.post(`/favorite-words/${encodeURIComponent(wordId)}`);
      console.log(`[FavoritesService] Successfully added ${wordId} to favorites via API`);
    } catch (error) {
      console.log(`[FavoritesService] API call failed, adding to sync queue: ${error}`);
      
      // Ajouter à la queue de synchronisation pour retry ultérieur
      await this.syncService.addToQueue({
        type: 'add',
        wordId,
        maxRetries: 3
      });
    }

    // Invalidate caches pour forcer un reload
    this.cacheService.delete("user-favorites");
    this.cacheService.delete("favorites-stats");
    if (collectionId) {
      this.cacheService.delete(`collection-${collectionId}-favorites`);
    }
  }

  /**
   * Remove word from favorites with robust synchronization
   */
  async removeFromFavorites(
    wordId: string,
    collectionId?: string
  ): Promise<void> {
    try {
      // Essayer d'abord l'API directement
      await this.apiService.delete(`/favorite-words/${encodeURIComponent(wordId)}`);
      console.log(`[FavoritesService] Successfully removed ${wordId} from favorites via API`);
    } catch (error) {
      console.log(`[FavoritesService] API call failed, adding to sync queue: ${error}`);
      
      // Ajouter à la queue de synchronisation pour retry ultérieur
      await this.syncService.addToQueue({
        type: 'remove',
        wordId,
        maxRetries: 3
      });
    }

    // Invalidate caches pour forcer un reload
    this.cacheService.delete("user-favorites");
    this.cacheService.delete("favorites-stats");
    if (collectionId) {
      this.cacheService.delete(`collection-${collectionId}-favorites`);
    }
  }

  /**
   * Check if word is in favorites with reliable fallback
   */
  async isFavorite(wordId: string): Promise<boolean> {
    try {
      // Essayer d'abord l'API
      const response = await this.apiService.get<boolean>(
        `/favorite-words/check/${encodeURIComponent(wordId)}`
      );
      return !!response.data;
    } catch (error) {
      console.log(`[FavoritesService] API check failed, using local fallback: ${error}`);
      
      // Fallback vers le cache en premier
      const cached = await this.cacheService.get<FavoriteWord[]>("user-favorites");
      if (cached) {
        return cached.some((fav) => fav.id === wordId);
      }

      // Fallback vers le storage local
      const localFavorites = await this.storageService.getItem<string>("favorites");
      if (localFavorites) {
        try {
          const favorites: FavoriteWord[] = JSON.parse(localFavorites);
          return favorites.some((fav) => fav.id === wordId);
        } catch {
          console.error('[FavoritesService] Failed to parse local favorites');
        }
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
      console.log(`[FavoritesService] Toggled OFF favorite for ${word.word}`);
      return false;
    } else {
      await this.addToFavorites(word.id);
      console.log(`[FavoritesService] Toggled ON favorite for ${word.word}`);
      return true;
    }
  }

  // ============ SYNC STATUS METHODS ============

  /**
   * Get synchronization status
   */
  async getSyncStatus() {
    return this.syncService.getSyncStatus();
  }

  /**
   * Force synchronization of all favorites
   */
  async forceSyncAll() {
    return this.syncService.forceSyncAll();
  }

  /**
   * Manually trigger sync of pending actions
   */
  async syncPendingActions() {
    return this.syncService.syncPendingActions();
  }

  /**
   * Get favorites by collection
   */
  async getFavoritesByCollection(
    collectionId: string
  ): Promise<FavoriteWord[]> {
    const cacheKey = `collection-${collectionId}-favorites`;
    const cached = await this.cacheService.get<FavoriteWord[]>(cacheKey);
    if (cached) {
      return cached;
    }
    // Local-only: filtrer depuis les favoris + collections locales
    const allFavs = await this.getFavorites();
    const collectionsRaw = await this.storageService.getItem<string>(
      "collections"
    );
    if (!collectionsRaw) {
      this.cacheService.set(cacheKey, [], this.CACHE_TTL.FAVORITES);
      return [];
    }
    const collections: FavoriteCollection[] = JSON.parse(collectionsRaw);
    const col = collections.find((c) => c.id === collectionId);
    if (!col) {
      this.cacheService.set(cacheKey, [], this.CACHE_TTL.FAVORITES);
      return [];
    }
    const favorites = allFavs.filter((f) => col.wordIds.includes(f.id));

    // Cache collection favorites
    this.cacheService.set(cacheKey, favorites, this.CACHE_TTL.FAVORITES);
    return favorites;
  }

  /**
   * Search within favorites
   */
  async searchFavorites(query: string): Promise<FavoriteWord[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getFavorites();
    const all = await this.getFavorites();
    return all.filter(
      (f) =>
        f.word.toLowerCase().includes(q) ||
        (f.definition || "").toLowerCase().includes(q) ||
        (f.category || "").toLowerCase().includes(q) ||
        (f.language || "").toLowerCase().includes(q)
    );
  }

  /**
   * Get favorites statistics
   */
  async getFavoritesStats(): Promise<FavoritesStats> {
    const cacheKey = "favorites-stats";
    const cached = await this.cacheService.get<FavoritesStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{
      favoriteWordsCount: number;
      totalWordsAdded: number;
      totalCommunityPosts: number;
    }>("/users/profile/stats");

    // Transform backend stats to FavoritesStats format
    const stats: FavoritesStats = {
      totalFavorites: response.data.favoriteWordsCount || 0,
      collectionsCount: 0, // Not available from this endpoint
      languageBreakdown: {}, // Not available from this endpoint
      categoryBreakdown: {}, // Not available from this endpoint
      recentlyAdded: [], // Not available from this endpoint
    };

    // Cache stats
    this.cacheService.set(cacheKey, stats, this.CACHE_TTL.STATS);

    return stats;
  }

  // ============ COLLECTIONS METHODS ============

  /**
   * Get all user's collections
   */
  async getCollections(): Promise<FavoriteCollection[]> {
    const cacheKey = "user-collections";
    const cached = await this.cacheService.get<FavoriteCollection[]>(cacheKey);
    if (cached) {
      return cached;
    }
    // Local-only: lire depuis le stockage
    const localCollections = await this.storageService.getItem<string>(
      "collections"
    );
    const collections: FavoriteCollection[] = localCollections
      ? JSON.parse(localCollections)
      : [];
    // Cache collections
    this.cacheService.set(cacheKey, collections, this.CACHE_TTL.COLLECTIONS);
    return collections;
  }

  /**
   * Create new collection
   */
  async createCollection(
    data: Omit<FavoriteCollection, "id" | "createdAt" | "updatedAt" | "wordIds">
  ): Promise<FavoriteCollection> {
    const localCollections = await this.getCollections();
    const now = new Date().toISOString();
    const collection: FavoriteCollection = {
      id: `col_${Date.now()}`,
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      tags: data.tags,
      wordIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...localCollections, collection];
    await this.storageService.setItem("collections", JSON.stringify(updated));
    this.cacheService.delete("user-collections");
    return collection;
  }

  /**
   * Update collection
   */
  async updateCollection(
    id: string,
    data: Partial<
      Pick<FavoriteCollection, "name" | "description" | "isPublic" | "tags">
    >
  ): Promise<FavoriteCollection> {
    const collections = await this.getCollections();
    const idx = collections.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Collection not found");
    const collection: FavoriteCollection = {
      ...collections[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const updated = [...collections];
    updated[idx] = collection;
    await this.storageService.setItem("collections", JSON.stringify(updated));
    this.cacheService.delete("user-collections");
    this.cacheService.delete(`collection-${id}-favorites`);
    return collection;
  }

  /**
   * Delete collection
   */
  async deleteCollection(id: string): Promise<void> {
    const collections = await this.getCollections();
    const updated = collections.filter((c) => c.id !== id);
    await this.storageService.setItem("collections", JSON.stringify(updated));
    this.cacheService.delete("user-collections");
    this.cacheService.delete(`collection-${id}-favorites`);
    this.cacheService.delete("user-favorites");
  }

  /**
   * Add word to specific collection
   */
  async addWordToCollection(
    wordId: string,
    collectionId: string
  ): Promise<void> {
    const collections = await this.getCollections();
    const idx = collections.findIndex((c) => c.id === collectionId);
    if (idx === -1) throw new Error("Collection not found");
    const col = { ...collections[idx] };
    if (!col.wordIds.includes(wordId)) col.wordIds.push(wordId);
    col.updatedAt = new Date().toISOString();
    const updated = [...collections];
    updated[idx] = col;
    await this.storageService.setItem("collections", JSON.stringify(updated));
    this.cacheService.delete(`collection-${collectionId}-favorites`);
  }

  /**
   * Remove word from specific collection
   */
  async removeWordFromCollection(
    wordId: string,
    collectionId: string
  ): Promise<void> {
    const collections = await this.getCollections();
    const idx = collections.findIndex((c) => c.id === collectionId);
    if (idx === -1) throw new Error("Collection not found");
    const col = { ...collections[idx] };
    col.wordIds = col.wordIds.filter((id) => id !== wordId);
    col.updatedAt = new Date().toISOString();
    const updated = [...collections];
    updated[idx] = col;
    await this.storageService.setItem("collections", JSON.stringify(updated));
    this.cacheService.delete(`collection-${collectionId}-favorites`);
  }

  /**
   * Move word between collections
   */
  async moveWordToCollection(
    wordId: string,
    fromCollectionId: string,
    toCollectionId: string
  ): Promise<void> {
    await this.removeWordFromCollection(wordId, fromCollectionId);
    await this.addWordToCollection(wordId, toCollectionId);
    this.cacheService.delete(`collection-${fromCollectionId}-favorites`);
    this.cacheService.delete(`collection-${toCollectionId}-favorites`);
  }

  // ============ ADVANCED FEATURES ============

  /**
   * Export favorites data
   */
  async exportFavorites(format: "json" | "csv" | "txt"): Promise<string> {
    const favs = await this.getFavorites();
    if (format === "json") {
      return JSON.stringify(favs, null, 2);
    }
    if (format === "csv") {
      const header =
        "id,word,language,pronunciation,definition,category,author,timeAgo,isFavorite,addedToFavoritesAt";
      const rows = favs.map((f) =>
        [
          f.id,
          JSON.stringify(f.word),
          f.language,
          JSON.stringify(f.pronunciation || ""),
          JSON.stringify(f.definition || ""),
          JSON.stringify(f.category || ""),
          JSON.stringify(f.author || ""),
          JSON.stringify(f.timeAgo || ""),
          String(!!f.isFavorite),
          JSON.stringify(f.addedToFavoritesAt),
        ].join(",")
      );
      return [header, ...rows].join("\n");
    }
    // txt
    return favs.map((f) => f.word).join("\n");
  }

  /**
   * Import favorites data
   */
  async importFavorites(
    data: string,
    format: "json" | "csv"
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const errors: string[] = [];
    let items: FavoriteWord[] = [];
    try {
      if (format === "json") {
        items = JSON.parse(data);
      } else {
        const lines = data.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            const [id, word] = lines[i].split(",");
            if (id && word) {
              items.push({
                id: id.trim(),
                word: JSON.parse(word.trim()),
                language: "unknown",
                pronunciation: "",
                definition: "",
                category: "",
                author: "",
                timeAgo: "Importé",
                isFavorite: true,
                addedToFavoritesAt: new Date().toISOString(),
                collections: [],
              });
            }
          }
        }
      }
    } catch (e: any) {
      errors.push("Parse error: " + e.message);
    }

    const existing = await this.getFavorites();
    const map = new Map(existing.map((f) => [f.id, f] as const));
    let imported = 0;
    let skipped = 0;
    for (const it of items) {
      if (map.has(it.id)) {
        skipped++;
        continue;
      }
      map.set(it.id, it);
      imported++;
    }
    const merged = Array.from(map.values());
    await this.storageService.setItem("favorites", JSON.stringify(merged));
    this.cacheService.delete("user-favorites");
    this.cacheService.delete("favorites-stats");
    return { imported, skipped, errors };
  }

  /**
   * Share collection with other users
   */
  async shareCollection(
    collectionId: string,
    userIds: string[]
  ): Promise<void> {
    // Non supporté côté backend: no-op
    console.warn(
      "[FavoritesService] shareCollection is not supported yet. No-op."
    );
  }

  /**
   * Get shared collections from other users
   */
  async getSharedCollections(): Promise<FavoriteCollection[]> {
    const cacheKey = "shared-collections";
    const cached = await this.cacheService.get<FavoriteCollection[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const collections: FavoriteCollection[] = [];
    this.cacheService.set(cacheKey, collections, this.CACHE_TTL.COLLECTIONS);
    return collections;
  }

  /**
   * Add personal notes to a favorite word
   */
  async addWordNotes(wordId: string, notes: string): Promise<void> {
    // Local-only: mettre à jour dans le stockage
    const favsRaw = await this.storageService.getItem<string>("favorites");
    const favs: FavoriteWord[] = favsRaw ? JSON.parse(favsRaw) : [];
    const idx = favs.findIndex((f) => f.id === wordId);
    if (idx !== -1) {
      favs[idx] = { ...favs[idx], notes };
      await this.storageService.setItem("favorites", JSON.stringify(favs));
      this.cacheService.delete("user-favorites");
      this.clearWordRelatedCaches(wordId);
    }
  }

  /**
   * Get word notes
   */
  async getWordNotes(wordId: string): Promise<string | null> {
    const localFavorites = await this.storageService.getItem<string>(
      "favorites"
    );
    if (localFavorites) {
      const favorites: FavoriteWord[] = JSON.parse(localFavorites);
      const favorite = favorites.find((fav) => fav.id === wordId);
      return favorite?.notes || null;
    }
    return null;
  }

  /**
   * Sync favorites with server (for offline support)
   */
  async syncFavorites(): Promise<{
    synchronized: boolean;
    conflicts: FavoriteWord[];
  }> {
    // Local-only: marquer la date de sync et vider les caches
    await this.storageService.setItem(
      "lastFavoritesSync",
      new Date().toISOString()
    );
    this.clearAllFavoritesCaches();
    return { synchronized: true, conflicts: [] };
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Clear all favorites-related caches
   */
  private clearAllFavoritesCaches(): void {
    const keys = this.cacheService.keys();
    keys.forEach((key) => {
      if (
        key.startsWith("user-favorites") ||
        key.startsWith("user-collections") ||
        key.startsWith("collection-") ||
        key.startsWith("favorites-stats") ||
        key.startsWith("shared-collections")
      ) {
        this.cacheService.delete(key);
      }
    });
  }

  /**
   * Clear caches related to a specific word
   */
  private clearWordRelatedCaches(wordId: string): void {
    const keys = this.cacheService.keys();
    keys.forEach((key) => {
      // Clear collection caches that might contain this word
      if (key.startsWith("collection-") && key.endsWith("-favorites")) {
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
