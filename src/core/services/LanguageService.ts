/**
 * @fileoverview Language Service Implementation
 * Module dédié pour la gestion des langues et correspondances
 * Suit les principes SOLID - Single Responsibility pour les opérations de langues
 */

import { IApiService } from "../interfaces/IApiService";
import { ICacheService } from "../interfaces/ICacheService";
import {
  ILanguageService,
  Language,
  LanguageMapping,
  LanguageStats,
  LanguageFilters,
  CreateLanguageData,
} from "../interfaces/ILanguageService";

/**
 * Service concret pour la gestion des langues
 * Responsabilité unique : langues et correspondances code/nom
 */
export class LanguageService implements ILanguageService {
  private readonly CACHE_TTL = {
    LANGUAGES: 3600, // 1 heure - les langues changent peu
    MAPPINGS: 7200, // 2 heures - mappings très stables
    STATS: 1800, // 30 minutes - stats plus dynamiques
  };

  constructor(
    private apiService: IApiService,
    private cacheService: ICacheService
  ) {}

  // ============ MÉTHODES DE BASE ============

  /**
   * Récupère toutes les langues disponibles
   */
  async getAllLanguages(filters?: LanguageFilters): Promise<Language[]> {
    const cacheKey = `languages:all:${JSON.stringify(filters || {})}`;
    const cached = await this.cacheService.get<Language[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (filters?.region) params.append("region", filters.region);
    if (filters?.isAfrican)
      params.append("isAfrican", filters.isAfrican.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.hasWords)
      params.append("hasWords", filters.hasWords.toString());
    if (filters?.minSpeakers)
      params.append("minSpeakers", filters.minSpeakers.toString());

    const url = params.toString()
      ? `/languages?${params.toString()}`
      : "/languages";
    const response = await this.apiService.get<any[]>(url);

    // Transformer _id → id pour compatibilité avec l'interface
    const transformedLanguages: Language[] = response.data.map(
      (backendLang) => ({
        id: backendLang._id,
        name: backendLang.name,
        nativeName: backendLang.nativeName,
        iso639_1: backendLang.iso639_1,
        iso639_2: backendLang.iso639_2,
        iso639_3: backendLang.iso639_3,
        family: backendLang.family,
        region: backendLang.region,
        countries: backendLang.countries,
        speakerCount: backendLang.speakerCount,
        status: backendLang.status,
        writingSystem: backendLang.writingSystem,
        direction: backendLang.direction,
        flagEmoji: backendLang.flagEmoji,
        flagEmojis: backendLang.flagEmojis,
        priority: backendLang.priority,
        isAfrican: backendLang.isAfrican,
        metadata: backendLang.metadata,
      })
    );

    // Cache résultats
    await this.cacheService.set(
      cacheKey,
      transformedLanguages,
      this.CACHE_TTL.LANGUAGES
    );

    return transformedLanguages;
  }

  /**
   * Récupère les langues africaines prioritaires
   */
  async getAfricanLanguages(): Promise<Language[]> {
    const cacheKey = "languages:african";
    const cached = await this.cacheService.get<Language[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<any[]>("/languages/african");

    // Transformer _id → id pour compatibilité avec l'interface
    const transformedLanguages: Language[] = response.data.map(
      (backendLang) => ({
        id: backendLang._id,
        name: backendLang.name,
        nativeName: backendLang.nativeName,
        iso639_1: backendLang.iso639_1,
        iso639_2: backendLang.iso639_2,
        iso639_3: backendLang.iso639_3,
        family: backendLang.family,
        region: backendLang.region,
        countries: backendLang.countries,
        speakerCount: backendLang.speakerCount,
        status: backendLang.status,
        writingSystem: backendLang.writingSystem,
        direction: backendLang.direction,
        flagEmoji: backendLang.flagEmoji,
        flagEmojis: backendLang.flagEmojis,
        priority: backendLang.priority,
        isAfrican: backendLang.isAfrican,
        metadata: backendLang.metadata,
      })
    );

    // Cache résultats pour 1 heure
    await this.cacheService.set(
      cacheKey,
      transformedLanguages,
      this.CACHE_TTL.LANGUAGES
    );

    return transformedLanguages;
  }

  /**
   * Récupère les langues populaires (avec le plus de mots)
   */
  async getPopularLanguages(limit: number = 10): Promise<Language[]> {
    const cacheKey = `languages:popular:${limit}`;
    const cached = await this.cacheService.get<Language[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    const response = await this.apiService.get<Language[]>(
      `/languages/popular?${params.toString()}`
    );

    // Cache résultats pour 30 minutes
    await this.cacheService.set(cacheKey, response.data, this.CACHE_TTL.STATS);

    return response.data;
  }

  /**
   * Récupère les détails d'une langue par ID ou code
   */
  async getLanguageById(identifier: string): Promise<Language> {
    const cacheKey = `language:${identifier}`;
    const cached = await this.cacheService.get<Language>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<any>(`/languages/${identifier}`);

    // Transformer _id → id pour compatibilité avec l'interface
    const transformedLanguage: Language = {
      id: response.data._id,
      name: response.data.name,
      nativeName: response.data.nativeName,
      iso639_1: response.data.iso639_1,
      iso639_2: response.data.iso639_2,
      iso639_3: response.data.iso639_3,
      family: response.data.family,
      region: response.data.region,
      countries: response.data.countries,
      speakerCount: response.data.speakerCount,
      status: response.data.status,
      writingSystem: response.data.writingSystem,
      direction: response.data.direction,
      flagEmoji: response.data.flagEmoji,
      flagEmojis: response.data.flagEmojis,
      priority: response.data.priority,
      isAfrican: response.data.isAfrican,
      metadata: response.data.metadata,
    };

    // Cache détails pour 1 heure
    await this.cacheService.set(
      cacheKey,
      transformedLanguage,
      this.CACHE_TTL.LANGUAGES
    );

    return transformedLanguage;
  }

  /**
   * Recherche de langues par nom/code
   */
  async searchLanguages(query: string): Promise<Language[]> {
    if (query.length < 2) return [];

    const cacheKey = `languages:search:${query.toLowerCase()}`;
    const cached = await this.cacheService.get<Language[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    params.append("q", query);

    const response = await this.apiService.get<any[]>(
      `/languages/search?${params.toString()}`
    );

    // Transformer _id → id pour compatibilité avec l'interface
    const transformedLanguages: Language[] = response.data.map(
      (backendLang) => ({
        id: backendLang._id,
        name: backendLang.name,
        nativeName: backendLang.nativeName,
        iso639_1: backendLang.iso639_1,
        iso639_2: backendLang.iso639_2,
        iso639_3: backendLang.iso639_3,
        family: backendLang.family,
        region: backendLang.region,
        countries: backendLang.countries,
        speakerCount: backendLang.speakerCount,
        status: backendLang.status,
        writingSystem: backendLang.writingSystem,
        direction: backendLang.direction,
        flagEmoji: backendLang.flagEmoji,
        flagEmojis: backendLang.flagEmojis,
        priority: backendLang.priority,
        isAfrican: backendLang.isAfrican,
        metadata: backendLang.metadata,
      })
    );

    // Cache recherches pour 30 minutes
    await this.cacheService.set(
      cacheKey,
      transformedLanguages,
      this.CACHE_TTL.STATS
    );

    return transformedLanguages;
  }

  // ============ MÉTHODES DE CORRESPONDANCE ============

  /**
   * Récupère une correspondance langue (code → nom) pour affichage
   */
  async getLanguageMapping(code: string): Promise<LanguageMapping | null> {
    try {
      // Essayer de récupérer depuis le cache des mappings complets
      const allMappings = await this.getAllLanguageMappings();
      return allMappings.get(code) || null;
    } catch (error) {
      console.error(
        `[LanguageService] Error getting mapping for code ${code}:`,
        error
      );
      return null;
    }
  }

  /**
   * Récupère toutes les correspondances pour utilisation hors ligne
   */
  async getAllLanguageMappings(): Promise<Map<string, LanguageMapping>> {
    const cacheKey = "language-mappings";
    const cached = await this.cacheService.get<Record<string, LanguageMapping>>(
      cacheKey
    );
    if (cached) {
      // Reconstruire la Map depuis l'objet caché
      const mappings = new Map<string, LanguageMapping>(Object.entries(cached));
      console.log(
        `[LanguageService] Loaded ${mappings.size} language mappings from cache`
      );

      // Debug: afficher quelques mappings
      const first3 = Array.from(mappings.entries()).slice(0, 3);
      console.log("[LanguageService] Sample mappings:", first3);

      return mappings;
    }

    try {
      const languages = await this.getAllLanguages({ status: "active" });
      const mappings = new Map<string, LanguageMapping>();

      languages.forEach((lang) => {
        const mapping: LanguageMapping = {
          code: lang.id,
          name: lang.name,
          nativeName: lang.nativeName,
          flag: lang.flagEmoji,
        };

        // Ajouter mappings pour tous les codes possibles
        mappings.set(lang.id, mapping); // ObjectId principal
        if (lang.iso639_1) mappings.set(lang.iso639_1, mapping);
        if (lang.iso639_2) mappings.set(lang.iso639_2, mapping);
        if (lang.iso639_3) mappings.set(lang.iso639_3, mapping);
        if (lang.name.toLowerCase())
          mappings.set(lang.name.toLowerCase(), mapping);

        // Debug: log pour le français spécifiquement
        if (lang.name === "Français") {
          console.log(
            `[LanguageService] Added French mapping: ${lang.id} → ${lang.name}`
          );
        }
      });

      console.log(
        `[LanguageService] Built ${mappings.size} language mappings from ${languages.length} languages`
      );

      // Cache les mappings pour 2 heures (très stable)
      const mappingsObj: Record<string, LanguageMapping> =
        Object.fromEntries(mappings);
      await this.cacheService.set(
        cacheKey,
        mappingsObj,
        this.CACHE_TTL.MAPPINGS
      );

      return mappings;
    } catch (error) {
      console.error(
        "[LanguageService] Error building language mappings:",
        error
      );
      return new Map();
    }
  }

  /**
   * Récupère les statistiques d'utilisation des langues
   */
  async getLanguageStats(): Promise<LanguageStats[]> {
    const cacheKey = "language-stats";
    const cached = await this.cacheService.get<LanguageStats[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<LanguageStats[]>(
      "/languages/stats"
    );

    // Cache stats pour 30 minutes
    await this.cacheService.set(cacheKey, response.data, this.CACHE_TTL.STATS);

    return response.data;
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Valide si un code de langue existe
   */
  async validateLanguageCode(code: string): Promise<boolean> {
    try {
      const mapping = await this.getLanguageMapping(code);
      return mapping !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convertit un code de langue vers un format spécifique
   */
  async convertLanguageCode(
    code: string,
    targetFormat: "iso639_1" | "iso639_2" | "iso639_3" | "name"
  ): Promise<string | null> {
    try {
      const language = await this.getLanguageById(code);

      switch (targetFormat) {
        case "iso639_1":
          return language.iso639_1 || null;
        case "iso639_2":
          return language.iso639_2 || null;
        case "iso639_3":
          return language.iso639_3 || null;
        case "name":
          return language.name;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Met en cache les correspondances langues pour usage hors ligne
   */
  async cacheLanguageMappings(): Promise<void> {
    await this.getAllLanguageMappings(); // Force le rechargement du cache
  }

  /**
   * Efface le cache des langues
   */
  async clearLanguageCache(): Promise<void> {
    console.log("[LanguageService] Clearing language cache...");
    const keys = this.cacheService.keys();
    let deletedCount = 0;
    keys.forEach((key) => {
      if (key.startsWith("language") || key.startsWith("languages")) {
        this.cacheService.delete(key);
        deletedCount++;
      }
    });
    console.log(`[LanguageService] Deleted ${deletedCount} cache entries`);
  }

  // ============ MÉTHODES DE CONTRIBUTION (CONTRIBUTOR+) ============

  /**
   * Propose une nouvelle langue (CONTRIBUTOR+)
   */
  async proposeLanguage(data: CreateLanguageData): Promise<Language> {
    const response = await this.apiService.post<Language>("/languages", data);

    // Invalider le cache des langues
    await this.clearLanguageCache();

    return response.data;
  }

  /**
   * Met à jour une langue existante (CONTRIBUTOR+ pour ses propres contributions, ADMIN+ pour toutes)
   */
  async updateLanguage(
    id: string,
    data: Partial<CreateLanguageData>
  ): Promise<Language> {
    const response = await this.apiService.put<Language>(
      `/languages/${id}`,
      data
    );

    // Invalider les caches concernés
    this.cacheService.delete(`language:${id}`);
    await this.clearLanguageCache();

    return response.data;
  }

  /**
   * Supprime une proposition de langue (CONTRIBUTOR+ pour ses propres contributions, ADMIN+ pour toutes)
   */
  async deleteLanguageProposal(id: string): Promise<void> {
    await this.apiService.delete(`/languages/${id}`);

    // Invalider les caches concernés
    this.cacheService.delete(`language:${id}`);
    await this.clearLanguageCache();
  }

  /**
   * Récupère les contributions de langues de l'utilisateur connecté
   */
  async getMyLanguageContributions(): Promise<Language[]> {
    const response = await this.apiService.get<Language[]>(
      "/languages/my-contributions"
    );
    return response.data;
  }

  // ============ MÉTHODES DE MODÉRATION (ADMIN+) ============

  /**
   * Récupère toutes les propositions de langues en attente (ADMIN+)
   */
  async getPendingLanguageProposals(): Promise<Language[]> {
    const response = await this.apiService.get<Language[]>(
      "/languages/pending"
    );
    return response.data;
  }

  /**
   * Approuve une proposition de langue (ADMIN+)
   */
  async approveLanguageProposal(
    id: string,
    moderatorNotes?: string
  ): Promise<Language> {
    const data = moderatorNotes ? { moderatorNotes } : {};
    const response = await this.apiService.post<Language>(
      `/languages/${id}/approve`,
      data
    );

    // Invalider le cache des langues
    await this.clearLanguageCache();

    return response.data;
  }

  /**
   * Rejette une proposition de langue (ADMIN+)
   */
  async rejectLanguageProposal(
    id: string,
    rejectionReason: string
  ): Promise<void> {
    await this.apiService.post(`/languages/${id}/reject`, { rejectionReason });

    // Invalider le cache des langues
    await this.clearLanguageCache();
  }

  /**
   * Change le statut d'une langue (ADMIN+)
   */
  async updateLanguageStatus(
    id: string,
    status: "active" | "deprecated",
    reason?: string
  ): Promise<Language> {
    const data = { status, reason };
    const response = await this.apiService.put<Language>(
      `/languages/${id}/status`,
      data
    );

    // Invalider le cache des langues
    await this.clearLanguageCache();

    return response.data;
  }

  /**
   * Récupère l'historique de modération d'une langue (ADMIN+)
   */
  async getLanguageModerationHistory(id: string): Promise<
    {
      id: string;
      action:
        | "created"
        | "updated"
        | "approved"
        | "rejected"
        | "status_changed";
      moderatorId: string;
      moderatorName: string;
      reason?: string;
      timestamp: Date;
    }[]
  > {
    const response = await this.apiService.get<
      Array<{
        id: string;
        action:
          | "created"
          | "updated"
          | "approved"
          | "rejected"
          | "status_changed";
        moderatorId: string;
        moderatorName: string;
        reason?: string;
        timestamp: Date;
      }>
    >(`/languages/${id}/moderation-history`);
    return response.data;
  }
}
