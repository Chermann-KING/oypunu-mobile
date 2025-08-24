/**
 * @fileoverview Dictionary Service Implementation
 * Follows SOLID principles - Single Responsibility for dictionary API operations
 */

import { Word, DetailedWord } from "../../types";
import {
  IDictionaryService,
  SearchFilters,
  SearchOptions,
  SearchResult,
  CreateWordData,
  Category,
  Language,
} from "../interfaces/IDictionaryService";
import { IApiService } from "../interfaces/IApiService";
import { ICacheService } from "../interfaces/ICacheService";

/**
 * Backend Word interface (as returned by the API)
 */
interface BackendWord {
  _id: string;
  word: string;
  languageId?:
    | {
        _id: string;
        name: string;
        nativeName?: string;
        iso639_1?: string;
        iso639_3?: string;
        flagEmoji?: string;
      }
    | string; // Peut être un ObjectId populé ou juste l'ID string
  language?: string; // Legacy ISO code field
  pronunciation?: string;
  etymology?: string;
  meanings?: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      examples: string[];
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  categoryId?:
    | {
        _id: string;
        name: string;
      }
    | string;
  createdBy?:
    | {
        _id: string;
        username?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        displayName?: string;
      }
    | string; // Peut être un ObjectId ou un objet populé
  author?: string; // Legacy author field (parfois présent)
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  audioFiles?: Map<string, any>;
}

/**
 * Concrete Dictionary Service
 * Handles all dictionary-related API operations
 */
export class DictionaryService implements IDictionaryService {
  constructor(
    private apiService: IApiService,
    private cacheService: ICacheService
  ) {}

  /**
   * Transform backend word data to detailed mobile format
   */
  private async transformBackendWordToDetailed(
    backendWord: BackendWord
  ): Promise<DetailedWord> {
    // Réutiliser la transformation de base
    let baseWord = this.transformBackendWord(backendWord);

    // 🔧 CORRECTIF : Si l'auteur n'est pas populé correctement dans les détails,
    // essayons de récupérer l'info depuis les caches des cartes qui fonctionnent bien
    if (baseWord.author === "Utilisateur" || baseWord.author.length > 20) {
      // Si c'est le fallback ou un ID
      console.log(
        "[DictionaryService] Tentative de récupération de l'auteur depuis les caches des cartes..."
      );

      try {
        // Essayer de trouver ce mot dans les caches des cartes qui ont les bonnes données d'auteur
        const recentWordsCache = await this.cacheService.get<Word[]>(
          "recent-words:limit=20&status=approved"
        );
        const popularWordsCache = await this.cacheService.get<Word[]>(
          "popular-words:limit=20"
        );

        const allCachedWords = [
          ...(recentWordsCache || []),
          ...(popularWordsCache || []),
        ];
        const cachedWord = allCachedWords.find((w) => w.id === backendWord._id);

        if (
          cachedWord &&
          cachedWord.author &&
          cachedWord.author !== "Utilisateur"
        ) {
          console.log(
            "[DictionaryService] Trouvé auteur depuis cache:",
            cachedWord.author
          );
          baseWord = { ...baseWord, author: cachedWord.author };
        } else {
          console.log(
            "[DictionaryService] Mot non trouvé dans les caches ou pas d'auteur valide"
          );
        }
      } catch (error) {
        console.warn(
          "[DictionaryService] Erreur lors de la récupération depuis cache:",
          error
        );
      }
    }

    // Extraire tous les exemples de toutes les définitions
    const allExamples: string[] = [];
    if (backendWord.meanings) {
      backendWord.meanings.forEach((meaning) => {
        meaning.definitions.forEach((def) => {
          if (def.examples) {
            allExamples.push(...def.examples);
          }
        });
      });
    }

    // Debug: log des données d'auteur et structure complète
    console.log("[DictionaryService] Full backend word data:", {
      _id: backendWord._id,
      word: backendWord.word,
      createdBy: backendWord.createdBy,
      createdAt: backendWord.createdAt,
      updatedAt: backendWord.updatedAt,
      status: backendWord.status,
      languageId: backendWord.languageId,
      categoryId: backendWord.categoryId,
      meanings: backendWord.meanings,
    });

    console.log("[DictionaryService] Author extraction:", {
      createdByType: typeof backendWord.createdBy,
      createdByContent: backendWord.createdBy,
      hasUsername:
        typeof backendWord.createdBy === "object"
          ? backendWord.createdBy?.username
          : "Not object",
      hasName:
        typeof backendWord.createdBy === "object"
          ? backendWord.createdBy?.name
          : "Not object",
      authorField: backendWord.author,
      isCreatedByPopulated:
        typeof backendWord.createdBy === "object" &&
        backendWord.createdBy !== null,
      finalAuthorInfo:
        typeof backendWord.createdBy === "object" && backendWord.createdBy
          ? {
              id: backendWord.createdBy._id,
              username: backendWord.createdBy.username,
              name: backendWord.createdBy.name,
            }
          : null,
    });

    // Extraire les synonymes et antonymes des meanings
    const synonyms: Array<{
      id: string;
      word: string;
      language: string;
      languageName?: string;
    }> = [];
    const antonyms: Array<{
      id: string;
      word: string;
      language: string;
      languageName?: string;
    }> = [];

    if (backendWord.meanings) {
      backendWord.meanings.forEach((meaning) => {
        if (meaning.synonyms) {
          meaning.synonyms.forEach((synonym, index) => {
            synonyms.push({
              id: `${backendWord._id}-synonym-${index}`, // ID généré
              word: synonym,
              language: backendWord.language || "unknown",
              languageName:
                typeof backendWord.languageId === "object"
                  ? backendWord.languageId?.name
                  : "Langue inconnue",
            });
          });
        }

        if (meaning.antonyms) {
          meaning.antonyms.forEach((antonym, index) => {
            antonyms.push({
              id: `${backendWord._id}-antonym-${index}`, // ID généré
              word: antonym,
              language: backendWord.language || "unknown",
              languageName:
                typeof backendWord.languageId === "object"
                  ? backendWord.languageId?.name
                  : "Langue inconnue",
            });
          });
        }
      });
    }

    // Récupérer les vraies traductions depuis l'API
    const translations = await this.getTranslations(backendWord._id).catch(
      () => []
    );

    // Ajouter les détails supplémentaires
    return {
      ...baseWord,
      etymology: backendWord.etymology,
      meanings: backendWord.meanings || [],
      languageInfo:
        typeof backendWord.languageId === "object" && backendWord.languageId
          ? {
              id: backendWord.languageId._id,
              name: backendWord.languageId.name,
              nativeName: backendWord.languageId.nativeName,
              flagEmoji: backendWord.languageId.flagEmoji,
              iso639_1: backendWord.languageId.iso639_1,
              iso639_3: backendWord.languageId.iso639_3,
            }
          : undefined,
      categoryInfo:
        typeof backendWord.categoryId === "object" && backendWord.categoryId
          ? {
              id: backendWord.categoryId._id,
              name: backendWord.categoryId.name,
            }
          : undefined,
      authorInfo:
        typeof backendWord.createdBy === "object" && backendWord.createdBy
          ? {
              id: backendWord.createdBy._id,
              username: backendWord.createdBy.username,
              name:
                backendWord.createdBy.name || backendWord.createdBy.displayName,
            }
          : typeof backendWord.createdBy === "string" && backendWord.createdBy
          ? {
              id: backendWord.createdBy,
              username: undefined, // À récupérer séparément si nécessaire
              name: undefined,
            }
          : undefined,
      // Nouvelles données
      examples: allExamples,
      synonyms,
      antonyms,
      translations,
      audioFiles: [], // TODO: Transform audioFiles Map to Array
      status: backendWord.status || "approved",
      createdAt: backendWord.createdAt || new Date().toISOString(),
      updatedAt: backendWord.updatedAt,
    };
  }

  /**
   * Transform backend word data to mobile format
   */
  private transformBackendWord(backendWord: BackendWord): Word {
    // Helper to get time ago string
    const getTimeAgo = (date?: string): string => {
      if (!date) return "Récemment";
      const now = new Date();
      const createdDate = new Date(date);
      const diffMs = now.getTime() - createdDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "Il y a moins d'une heure";
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays}j`;
      return createdDate.toLocaleDateString("fr-FR");
    };

    // Extract first definition from meanings
    const getDefinition = (meanings?: BackendWord["meanings"]): string => {
      if (!meanings || meanings.length === 0)
        return "Définition non disponible";
      const firstMeaning = meanings[0];
      if (!firstMeaning.definitions || firstMeaning.definitions.length === 0) {
        return "Définition non disponible";
      }
      return firstMeaning.definitions[0].definition;
    };

    // Get language identifier (prioritize populated languageId over legacy language field)
    const getLanguage = (
      languageId?: BackendWord["languageId"],
      language?: string
    ): string => {
      // languageId peut être un objet MongoDB populé ou juste l'ObjectId
      if (languageId && typeof languageId === "object" && languageId.name) {
        // Cas où languageId est populé avec les données de langue
        return languageId.name; // Utiliser le nom complet directement
      } else if (typeof languageId === "string" && languageId) {
        // Cas où languageId est juste l'ObjectId - sera mappé par le LanguageService
        return languageId;
      }
      // Fallback vers le champ legacy ISO code
      return language || "unknown";
    };

    // Get part of speech from meanings (plus pertinent pour les cartes que la catégorie)
    const getPartOfSpeech = (meanings?: BackendWord["meanings"]): string => {
      if (!meanings || meanings.length === 0) return "Non spécifié";
      const partOfSpeech = meanings[0].partOfSpeech;

      // Mapping des parties du discours en français
      const partOfSpeechMap: Record<string, string> = {
        noun: "Nom",
        verb: "Verbe",
        adjective: "Adjectif",
        adverb: "Adverbe",
        pronoun: "Pronom",
        preposition: "Préposition",
        conjunction: "Conjonction",
        interjection: "Interjection",
        article: "Article",
        determiner: "Déterminant",
      };

      return partOfSpeechMap[partOfSpeech] || partOfSpeech || "Non spécifié";
    };

    // Get author name
    const getAuthor = (
      createdBy?: BackendWord["createdBy"],
      legacyAuthor?: string
    ): string => {
      console.log("[DictionaryService] Transform Author data:", {
        createdByType: typeof createdBy,
        createdByContent: createdBy,
        username:
          typeof createdBy === "object" ? createdBy?.username : undefined,
        name: typeof createdBy === "object" ? createdBy?.name : undefined,
        displayName:
          typeof createdBy === "object" ? createdBy?.displayName : undefined,
        _id: typeof createdBy === "object" ? createdBy?._id : createdBy,
        legacyAuthor,
      });

      let author = "Auteur inconnu";

      if (typeof createdBy === "object" && createdBy) {
        // If createdBy is populated object
        author =
          createdBy.username ||
          createdBy.displayName ||
          createdBy.name ||
          (createdBy.firstName && createdBy.lastName
            ? `${createdBy.firstName} ${createdBy.lastName}`
            : "") ||
          "Auteur inconnu";
      } else if (typeof createdBy === "string") {
        // If createdBy is just ObjectId - use legacy author field, or fallback to "Utilisateur"
        author = legacyAuthor || "Utilisateur";
      } else if (legacyAuthor) {
        // Fallback to legacy author field
        author = legacyAuthor;
      }

      console.log("[DictionaryService] Final author name:", author);
      return author;
    };

    return {
      id: backendWord._id,
      word: backendWord.word,
      language: getLanguage(backendWord.languageId, backendWord.language),
      pronunciation: backendWord.pronunciation || "",
      definition: getDefinition(backendWord.meanings),
      category: getPartOfSpeech(backendWord.meanings),
      author: getAuthor(backendWord.createdBy, backendWord.author),
      timeAgo: getTimeAgo(backendWord.createdAt),
      isFavorite: false, // Will be updated by favorites service
    };
  }

  /**
   * Transform array of backend words to mobile format
   */
  private transformBackendWords(backendWords: BackendWord[]): Word[] {
    return backendWords.map((word) => this.transformBackendWord(word));
  }

  /**
   * Search words with filters and pagination
   */
  async searchWords(options: SearchOptions): Promise<SearchResult> {
    const {
      query,
      filters = {},
      limit = 20,
      offset = 0,
      sortBy = "relevance",
      sortOrder = "desc",
    } = options;

    // Build query parameters
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    // Add filters
    if (filters.language) params.append("language", filters.language);
    if (filters.category) params.append("category", filters.category);
    if (filters.partOfSpeech)
      params.append("partOfSpeech", filters.partOfSpeech);
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.author) params.append("author", filters.author);

    // Check cache first for searches
    const cacheKey = `search:${params.toString()}`;
    const cached = await this.cacheService.get<SearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{
      words: BackendWord[];
      data?: BackendWord[];
      total: number;
      hasMore: boolean;
      filters: {
        availableLanguages: string[];
        availableCategories: string[];
      };
    }>(`/words/search?${params.toString()}`);

    const backendWords = response.data.words || response.data.data || [];

    const result: SearchResult = {
      words: this.transformBackendWords(backendWords),
      total: response.data.total,
      hasMore: response.data.hasMore,
      filters: response.data.filters,
    };

    // Cache search results for 5 minutes
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get word details by ID
   */
  async getWordById(id: string): Promise<Word> {
    const cacheKey = `word:${id}`;
    const cached = await this.cacheService.get<Word>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<BackendWord>(`/words/${id}`);

    const word = this.transformBackendWord(response.data);

    // Cache word details for 1 hour
    await this.cacheService.set(cacheKey, word, 3600);

    return word;
  }

  /**
   * Get detailed word information by ID (for word details screen)
   */
  async getDetailedWordById(id: string): Promise<DetailedWord> {
    const cacheKey = `detailed-word:${id}`;
    const cached = await this.cacheService.get<DetailedWord>(cacheKey);
    if (cached) {
      return cached;
    }

    // Stratégie 1: Essayer d'utiliser l'endpoint de recherche qui marche bien pour les cartes
    // Rechercher le mot par son ID dans la liste générale qui a les bonnes données d'auteur
    console.log(
      `[DictionaryService] Trying search approach for word ID: ${id}`
    );

    let response;
    try {
      // Utiliser l'endpoint de liste qui populé correctement les données (comme pour les cartes)
      response = await this.apiService.get<{
        words: BackendWord[];
        data?: BackendWord[];
      }>("/words?limit=100&status=approved");

      console.log(
        `[DictionaryService] Search response: ${
          response.data.words?.length || response.data?.data?.length || 0
        } words`
      );

      const backendWords = response.data.words || response.data.data || [];
      const targetWord = backendWords.find((word) => word._id === id);

      if (targetWord) {
        console.log(
          "[DictionaryService] Found word in list, author:",
          targetWord.createdBy
        );
        response = { data: targetWord };
      } else {
        throw new Error(
          "Word not found in list, falling back to direct endpoint"
        );
      }
    } catch (error) {
      console.warn(
        "[DictionaryService] Search approach failed, trying direct endpoint:",
        error
      );

      // Stratégie 2: Fallback vers l'endpoint direct avec populate
      const params = new URLSearchParams();
      params.append("populate", "createdBy");
      params.append("populate", "languageId");
      params.append("populate", "categoryId");

      try {
        response = await this.apiService.get<BackendWord>(
          `/words/${id}?${params.toString()}`
        );
        console.log(
          "[DictionaryService] Direct endpoint response createdBy:",
          typeof response.data.createdBy,
          response.data.createdBy
        );
      } catch (directError) {
        console.warn(
          "[DictionaryService] Direct endpoint with populate failed, trying without:",
          directError
        );
        response = await this.apiService.get<BackendWord>(`/words/${id}`);
      }
    }

    const detailedWord = await this.transformBackendWordToDetailed(
      response.data
    );

    // Cache detailed word for 1 hour
    await this.cacheService.set(cacheKey, detailedWord, 3600);

    return detailedWord;
  }

  /**
   * Get random words for discovery
   */
  async getRandomWords(count = 10, language?: string): Promise<Word[]> {
    const params = new URLSearchParams();
    params.append("count", count.toString());
    if (language) params.append("language", language);
    // Backend n'a pas d'endpoint random public documenté.
    // Fallback pragmatique: utiliser /words (liste paginée) et mélanger côté client.
    const response = await this.apiService.get<{
      words?: any[];
      data?: any[];
      total?: number;
    }>(`/words?limit=${Math.max(count * 2, 20)}&status=approved`);
    const backendWords = response.data.words || response.data.data || [];
    const shuffled = [...backendWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    return this.transformBackendWords(shuffled);
  }

  /**
   * Get word suggestions based on partial input
   */
  async getWordSuggestions(
    partial: string,
    language?: string
  ): Promise<string[]> {
    if (partial.length < 2) return [];

    const params = new URLSearchParams();
    params.append("q", partial);
    if (language) params.append("language", language);

    // Check cache for suggestions
    const cacheKey = `suggestions:${params.toString()}`;
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Aligner avec backend: suggestions via /search/suggestions
    const response = await this.apiService.get<{ suggestions: string[] }>(
      `/search/suggestions?${params.toString()}`
    );

    // Cache suggestions for 10 minutes
    await this.cacheService.set(cacheKey, response.data.suggestions, 600);

    return response.data.suggestions;
  }

  /**
   * Get all available categories
   */
  async getCategories(language?: string): Promise<Category[]> {
    const cacheKey = `categories${language ? `:${language}` : ""}`;
    const cached = await this.cacheService.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = language ? `?language=${language}` : "";
    const response = await this.apiService.get<
      { data?: Category[] } | Category[]
    >(`/categories${params}`);
    const list = Array.isArray(response.data)
      ? (response.data as Category[])
      : (response.data?.data as Category[]) || [];

    // Cache categories for 30 minutes
    await this.cacheService.set(cacheKey, list, 1800);

    return list;
  }

  /**
   * Get category details by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const cacheKey = `category:${id}`;
    const cached = await this.cacheService.get<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<Category>(`/categories/${id}`);

    // Cache category details for 1 hour
    await this.cacheService.set(cacheKey, response.data, 3600);

    return response.data;
  }

  /**
   * Get all available languages
   */
  async getLanguages(): Promise<Language[]> {
    const cacheKey = "languages";
    const cached = await this.cacheService.get<Language[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<Language[]>("/languages");

    // Cache languages for 1 hour (they don't change often)
    await this.cacheService.set(cacheKey, response.data, 3600);

    return response.data;
  }

  /**
   * Get language details by ID or code
   */
  async getLanguage(identifier: string): Promise<Language> {
    const cacheKey = `language:${identifier}`;
    const cached = await this.cacheService.get<Language>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<Language>(
      `/languages/${identifier}`
    );

    // Cache language details for 1 hour
    await this.cacheService.set(cacheKey, response.data, 3600);

    return response.data;
  }

  /**
   * Get words by category
   */
  async getWordsByCategory(categoryId: string, limit = 50): Promise<Word[]> {
    const cacheKey = `category-words:${categoryId}:${limit}`;
    const cached = await this.cacheService.get<Word[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ data?: Word[] } | Word[]>(
      `/categories/${categoryId}/words?limit=${limit}`
    );
    const list = Array.isArray(response.data)
      ? (response.data as Word[])
      : (response.data?.data as Word[]) || [];

    // Cache category words for 15 minutes
    await this.cacheService.set(cacheKey, list, 900);

    return list;
  }

  /**
   * Get recently added words
   */
  async getRecentWords(limit = 20, language?: string): Promise<Word[]> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("status", "approved");
    if (language) params.append("language", language);

    const cacheKey = `recent-words:${params.toString()}`;
    const cached = await this.cacheService.get<Word[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Use /words endpoint which returns recent words by default when sorted by date
    const response = await this.apiService.get<{
      words: BackendWord[];
      data?: BackendWord[]; // Fallback for different response formats
    }>(`/words?${params.toString()}`);

    const backendWords = response.data.words || response.data.data || [];
    const words = this.transformBackendWords(backendWords);

    // Cache recent words for 5 minutes
    await this.cacheService.set(cacheKey, words, 300);

    return words;
  }

  /**
   * Get popular/trending words
   */
  async getPopularWords(limit = 20, language?: string): Promise<Word[]> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (language) params.append("language", language);

    const cacheKey = `popular-words:${params.toString()}`;
    const cached = await this.cacheService.get<Word[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Use /words/featured endpoint which returns popular/featured words
    const response = await this.apiService.get<BackendWord[]>(
      `/words/featured?${params.toString()}`
    );

    const backendWords = Array.isArray(response.data) ? response.data : [];
    const words = this.transformBackendWords(backendWords);

    // Cache popular words for 10 minutes
    await this.cacheService.set(cacheKey, words, 600);

    return words;
  }

  /**
   * Get total approved words for a language
   * Tries /words with status=approved and reads `total` if present.
   * Falls back to /words/search if needed.
   */
  async getApprovedWordCount(language: string): Promise<number> {
    try {
      // Prefer ISO code or language id as provided
      const params = new URLSearchParams();
      params.append("status", "approved");
      params.append("limit", "1");
      params.append("language", language);

      const resp = await this.apiService.get<{
        words?: any[];
        data?: any[];
        total?: number;
      }>(`/words?${params.toString()}`);

      if (typeof resp.data.total === "number") return resp.data.total;

      // Fallback using search endpoint
      const searchResp = await this.apiService.get<{
        total?: number;
      }>(
        `/words/search?language=${encodeURIComponent(
          language
        )}&status=approved&limit=1`
      );
      return typeof searchResp.data.total === "number"
        ? searchResp.data.total
        : 0;
    } catch (e) {
      console.warn("[DictionaryService] getApprovedWordCount failed", e);
      return 0;
    }
  }

  // ============ CONTRIBUTOR METHODS ============

  /**
   * Create new word (CONTRIBUTOR+)
   */
  async createWord(data: CreateWordData): Promise<Word> {
    // Validate required fields (catégorie facultative, définition via meanings possible)
    if (!data.word || !data.language) {
      throw new Error("Word and language are required");
    }

    const formData = new FormData();

    // Add text fields
    formData.append("word", data.word);
    formData.append("language", data.language);
    if (data.definition) formData.append("definition", data.definition);
    if (data.category) formData.append("category", data.category);

    if (data.pronunciation)
      formData.append("pronunciation", data.pronunciation);
    if (data.etymology) formData.append("etymology", data.etymology);
    if (data.partOfSpeech) formData.append("partOfSpeech", data.partOfSpeech);
    if (data.difficulty) formData.append("difficulty", data.difficulty);

    if (data.meanings && data.meanings.length > 0) {
      formData.append("meanings", JSON.stringify(data.meanings));
    } else if (data.definition) {
      // Backward compat: construire un meanings minimal à partir de definition/examples
      const fallback = [
        {
          partOfSpeech: data.partOfSpeech,
          definitions: [
            { definition: data.definition, examples: data.examples || [] },
          ],
        },
      ];
      formData.append("meanings", JSON.stringify(fallback));
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Add audio file if present
    if (data.audioFile) {
      formData.append("audioFile", data.audioFile as any);
    }

    const response = await this.apiService.post<Word>("/words", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Clear related caches
    await this.clearWordCaches(data.language, data.category);

    return response.data;
  }

  /**
   * Update existing word (CONTRIBUTOR+)
   */
  async updateWord(id: string, data: Partial<CreateWordData>): Promise<Word> {
    const formData = new FormData();

    // Add only provided fields
    if (data.word) formData.append("word", data.word);
    if (data.language) formData.append("language", data.language);
    if (data.definition) formData.append("definition", data.definition);
    if (data.category) formData.append("category", data.category);
    if (data.pronunciation)
      formData.append("pronunciation", data.pronunciation);
    if (data.etymology) formData.append("etymology", data.etymology);
    if (data.partOfSpeech) formData.append("partOfSpeech", data.partOfSpeech);
    if (data.difficulty) formData.append("difficulty", data.difficulty);

    if (data.meanings && data.meanings.length > 0) {
      formData.append("meanings", JSON.stringify(data.meanings));
    } else if (data.definition) {
      const fallback = [
        {
          partOfSpeech: data.partOfSpeech,
          definitions: [
            { definition: data.definition, examples: data.examples || [] },
          ],
        },
      ];
      formData.append("meanings", JSON.stringify(fallback));
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    if (data.audioFile) {
      formData.append("audioFile", data.audioFile as any);
    }

    const response = await this.apiService.put<Word>(`/words/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Clear specific word cache and related caches
    this.cacheService.delete(`word:${id}`);
    if (data.language || data.category) {
      await this.clearWordCaches(data.language, data.category);
    }

    return response.data;
  }

  /**
   * Upload audio pronunciation (CONTRIBUTOR+)
   */
  async uploadWordAudio(
    wordId: string,
    audioFile: File
  ): Promise<{ audioUrl: string }> {
    const formData = new FormData();
    formData.append("audioFile", audioFile as any);

    const response = await this.apiService.post<{ audioUrl: string }>(
      `/words/${wordId}/audio`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Clear specific word cache
    this.cacheService.delete(`word:${wordId}`);

    return response.data;
  }

  /**
   * Create new category (CONTRIBUTOR+)
   */
  async createCategory(
    data: Omit<Category, "id" | "wordCount">
  ): Promise<Category> {
    const response = await this.apiService.post<Category>("/categories", data);

    // Clear categories cache
    this.cacheService.delete("categories");
    this.cacheService.delete(`categories:${data.language}`);

    return response.data;
  }

  /**
   * Propose new language (CONTRIBUTOR+)
   */
  async proposeLanguage(
    data: Omit<Language, "id" | "status">
  ): Promise<Language> {
    const response = await this.apiService.post<Language>(
      "/dictionary/languages",
      data
    );

    // Clear languages cache
    this.cacheService.delete("languages");

    return response.data;
  }

  /**
   * Get user's contributions status
   */
  async getContributionStats(userId?: string): Promise<{
    wordsAdded: number;
    wordsApproved: number;
    wordsPending: number;
    wordsRejected: number;
    categoriesCreated: number;
    languagesProposed: number;
  }> {
    const endpoint = userId
      ? `/users/profile/stats` // User-specific stats
      : "/users/profile/stats"; // Current user stats (requires auth)

    const response = await this.apiService.get<{
      wordsAdded: number;
      wordsApproved: number;
      wordsPending: number;
      wordsRejected: number;
      categoriesCreated: number;
      languagesProposed: number;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get pending contributions for moderation (ADMIN+)
   */
  async getPendingContributions(): Promise<{
    words: Word[];
    categories: Category[];
    languages: Language[];
  }> {
    const response = await this.apiService.get<{
      words: Word[];
      categories: Category[];
      languages: Language[];
    }>("/dictionary/admin/pending");

    return response.data;
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Get translations for a word using the correct API endpoint
   */
  private async getTranslations(
    wordId: string
  ): Promise<
    Array<{ id: string; word: string; language: string; languageName: string }>
  > {
    try {
      console.log(
        `[DictionaryService] Fetching translations for word ${wordId}`
      );

      // Utiliser l'endpoint correct pour les traductions
      const response = await this.apiService.get<{
        wordId: string;
        sourceWord: string;
        sourceLanguage: string;
        translations: Array<{
          id: string;
          word: string;
          language: string;
          languageName: string;
          meanings: any[];
          confidence: number;
          verified: boolean;
          createdBy: string;
          createdAt: Date;
        }>;
      }>(`/words-translations/${wordId}/all`);

      console.log(`[DictionaryService] Translations response:`, response.data);

      if (response.data.translations) {
        return response.data.translations.map((translation) => ({
          id: translation.id,
          word: translation.word,
          language: translation.language,
          languageName:
            translation.languageName || translation.language || "Inconnue",
        }));
      }

      return [];
    } catch (error: any) {
      console.log(
        `[DictionaryService] Failed to get translations: ${error.message}`
      );
      return [];
    }
  }

  /**
   * Clear word-related caches when words are modified
   */
  private async clearWordCaches(
    language?: string,
    category?: string
  ): Promise<void> {
    // Clear general caches
    this.cacheService.delete("recent-words:limit=20");
    this.cacheService.delete("popular-words:limit=20");

    if (language) {
      this.cacheService.delete(`recent-words:limit=20&language=${language}`);
      this.cacheService.delete(`popular-words:limit=20&language=${language}`);
    }

    if (category) {
      // Clear category-specific caches by iterating through keys
      const keys = this.cacheService.keys();
      keys.forEach((key) => {
        if (key.startsWith(`category-words:${category}:`)) {
          this.cacheService.delete(key);
        }
      });
    }

    // Clear search and suggestion caches by iterating through keys
    const keys = this.cacheService.keys();
    keys.forEach((key) => {
      if (key.startsWith("search:") || key.startsWith("suggestions:")) {
        this.cacheService.delete(key);
      }
    });
  }
}
