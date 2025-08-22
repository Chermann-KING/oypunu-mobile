/**
 * @fileoverview Dictionary Service Interface
 * Follows SOLID principles - Single Responsibility for dictionary operations
 */

import { Word } from '../../types';

export interface SearchFilters {
  language?: string;
  category?: string;
  partOfSpeech?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  author?: string;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
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
  definition: string;
  category: string;
  pronunciation?: string;
  examples?: string[];
  etymology?: string;
  partOfSpeech?: string;
  difficulty?: string;
  tags?: string[];
  audioFile?: File;
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
  code: string; // ISO 639-1 or 639-3
  family: string;
  speakers: number;
  region: string[];
  status: 'active' | 'proposed' | 'deprecated';
  writingSystem: string;
  direction: 'ltr' | 'rtl' | 'vertical';
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
  uploadWordAudio(wordId: string, audioFile: File): Promise<{ audioUrl: string }>;

  /**
   * Create new category (CONTRIBUTOR+)
   */
  createCategory(data: Omit<Category, 'id' | 'wordCount'>): Promise<Category>;

  /**
   * Propose new language (CONTRIBUTOR+)
   */
  proposeLanguage(data: Omit<Language, 'id' | 'status'>): Promise<Language>;

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