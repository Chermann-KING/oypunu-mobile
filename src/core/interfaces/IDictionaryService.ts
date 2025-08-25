/**
 * @fileoverview Dictionary Service Interface
 * Follows SOLID principles - Single Responsibility for dictionary operations
 */

import { Word, DetailedWord } from "../../types";

export interface SearchFilters {
  language?: string;
  category?: string;
  partOfSpeech?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  author?: string;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: "relevance" | "date" | "alphabetical";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult {
  words: Word[];
  total: number;
  hasMore: boolean;
  filters: {
    availableLanguages: string[];
    availableCategories: string[];
  };
}

export interface CreateWordData {
  word: string;
  language: string;
  definition?: string;
  category?: string;
  pronunciation?: string;
  examples?: string[];
  etymology?: string;
  partOfSpeech?: string;
  difficulty?: string;
  tags?: string[];
  audioFile?: File;
  // Nouveau: support des sens multiples alignés sur le backend
  meanings?: Array<{
    partOfSpeech?: string;
    definitions: Array<{
      definition: string;
      examples?: string[];
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  language: string;
  parentId?: string;
  wordCount: number;
  color?: string;
  icon?: string;
}

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  iso639_1?: string; // Code ISO 2 lettres (ex: "fr")
  iso639_2?: string; // Code ISO 3 lettres (ex: "fra")
  iso639_3?: string; // Code ISO 3 lettres étendu (ex: "fan")
  family?: string;
  region?: string;
  countries?: string[]; // Codes pays (ex: ["GA", "GQ", "CM"])
  speakerCount?: number;
  status: "active" | "proposed" | "deprecated";
  writingSystem?: string;
  direction?: "ltr" | "rtl" | "vertical";
  flagEmoji?: string;
  flagEmojis?: string[];
  priority?: number;
  isAfrican?: boolean;
  metadata?: {
    description?: string;
    sources?: string[];
    lastUpdated?: Date;
  };
  // Champs legacy pour compatibilité
  code?: string; // Alias pour iso639_1 ou iso639_3
  speakers?: number; // Alias pour speakerCount
}

/**
 * Dictionary service interface
 * Handles word search, retrieval, and management
 */
export interface IDictionaryService {
  /**
   * Search words with filters and pagination
   */
  searchWords(options: SearchOptions): Promise<SearchResult>;

  /**
   * Get word details by ID
   */
  getWordById(id: string): Promise<Word>;

  /**
   * Get detailed word information by ID (for word details screen)
   */
  getDetailedWordById(id: string): Promise<DetailedWord>;

  /**
   * Get random words for discovery
   */
  getRandomWords(count?: number, language?: string): Promise<Word[]>;

  /**
   * Get word suggestions based on partial input
   */
  getWordSuggestions(partial: string, language?: string): Promise<string[]>;

  /**
   * Get all available categories
   */
  getCategories(language?: string): Promise<Category[]>;

  /**
   * Get category details by ID
   */
  getCategoryById(id: string): Promise<Category>;

  /**
   * Get all available languages
   */
  getLanguages(): Promise<Language[]>;

  /**
   * Get language details by ID or code
   */
  getLanguage(identifier: string): Promise<Language>;

  /**
   * Get words by category
   */
  getWordsByCategory(categoryId: string, limit?: number): Promise<Word[]>;

  /**
   * Get recently added words
   */
  getRecentWords(limit?: number, language?: string): Promise<Word[]>;

  /**
   * Get popular/trending words
   */
  getPopularWords(limit?: number, language?: string): Promise<Word[]>;

  /**
   * Get the total number of approved words for a given language
   * The language identifier can be an ISO code (preferred) or an ID fallback
   */
  getApprovedWordCount(language: string): Promise<number>;

  // Contributor-only methods (when user has CONTRIBUTOR role)

  /**
   * Create new word (CONTRIBUTOR+)
   */
  createWord(data: CreateWordData): Promise<Word>;

  /**
   * Update existing word (CONTRIBUTOR+)
   */
  updateWord(id: string, data: Partial<CreateWordData>): Promise<Word>;

  /**
   * Upload audio pronunciation (CONTRIBUTOR+)
   */
  uploadWordAudio(
    wordId: string,
    audioFile: File
  ): Promise<{ audioUrl: string }>;

  /**
   * Create new category (CONTRIBUTOR+)
   */
  createCategory(data: Omit<Category, "id" | "wordCount">): Promise<Category>;

  /**
   * Propose new language (CONTRIBUTOR+)
   */
  proposeLanguage(data: Omit<Language, "id" | "status">): Promise<Language>;

  /**
   * Get user's contributions status
   */
  getContributionStats(userId?: string): Promise<{
    wordsAdded: number;
    wordsApproved: number;
    wordsPending: number;
    wordsRejected: number;
    categoriesCreated: number;
    languagesProposed: number;
  }>;

  /**
   * Get pending contributions for moderation (ADMIN+)
   */
  getPendingContributions(): Promise<{
    words: Word[];
    categories: Category[];
    languages: Language[];
  }>;
}
