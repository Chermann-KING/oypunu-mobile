/**
 * @fileoverview Dictionary Service Implementation
 * Follows SOLID principles - Single Responsibility for dictionary API operations
 */

import { Word } from '../../types';
import { 
  IDictionaryService,
  SearchFilters,
  SearchOptions,
  SearchResult,
  CreateWordData,
  Category,
  Language
} from '../interfaces/IDictionaryService';
import { IApiService } from '../interfaces/IApiService';
import { ICacheService } from '../interfaces/ICacheService';

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
   * Search words with filters and pagination
   */
  async searchWords(options: SearchOptions): Promise<SearchResult> {
    const { query, filters = {}, limit = 20, offset = 0, sortBy = 'relevance', sortOrder = 'desc' } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    // Add filters
    if (filters.language) params.append('language', filters.language);
    if (filters.category) params.append('category', filters.category);
    if (filters.partOfSpeech) params.append('partOfSpeech', filters.partOfSpeech);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.author) params.append('author', filters.author);

    // Check cache first for searches
    const cacheKey = `search:${params.toString()}`;
    const cached = await this.cacheService.get<SearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{
      data: Word[];
      total: number;
      hasMore: boolean;
      filters: {
        availableLanguages: string[];
        availableCategories: string[];
      };
    }>(`/dictionary/search?${params.toString()}`);

    const result: SearchResult = {
      words: response.data.data,
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

    const response = await this.apiService.get<Word>(`/dictionary/words/${id}`);
    
    // Cache word details for 1 hour
    await this.cacheService.set(cacheKey, response.data, 3600);
    
    return response.data;
  }

  /**
   * Get random words for discovery
   */
  async getRandomWords(count = 10, language?: string): Promise<Word[]> {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (language) params.append('language', language);

    const response = await this.apiService.get<{ data: Word[] }>(
      `/dictionary/words/random?${params.toString()}`
    );

    return response.data.data;
  }

  /**
   * Get word suggestions based on partial input
   */
  async getWordSuggestions(partial: string, language?: string): Promise<string[]> {
    if (partial.length < 2) return [];

    const params = new URLSearchParams();
    params.append('q', partial);
    if (language) params.append('language', language);

    // Check cache for suggestions
    const cacheKey = `suggestions:${params.toString()}`;
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ suggestions: string[] }>(
      `/dictionary/suggestions?${params.toString()}`
    );

    // Cache suggestions for 10 minutes
    await this.cacheService.set(cacheKey, response.data.suggestions, 600);
    
    return response.data.suggestions;
  }

  /**
   * Get all available categories
   */
  async getCategories(language?: string): Promise<Category[]> {
    const cacheKey = `categories${language ? `:${language}` : ''}`;
    const cached = await this.cacheService.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = language ? `?language=${language}` : '';
    const response = await this.apiService.get<{ data: Category[] }>(
      `/dictionary/categories${params}`
    );

    // Cache categories for 30 minutes
    await this.cacheService.set(cacheKey, response.data.data, 1800);
    
    return response.data.data;
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

    const response = await this.apiService.get<Category>(`/dictionary/categories/${id}`);
    
    // Cache category details for 1 hour
    await this.cacheService.set(cacheKey, response.data, 3600);
    
    return response.data;
  }

  /**
   * Get all available languages
   */
  async getLanguages(): Promise<Language[]> {
    const cacheKey = 'languages';
    const cached = await this.cacheService.get<Language[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ data: Language[] }>('/dictionary/languages');

    // Cache languages for 1 hour (they don't change often)
    await this.cacheService.set(cacheKey, response.data.data, 3600);
    
    return response.data.data;
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

    const response = await this.apiService.get<Language>(`/dictionary/languages/${identifier}`);
    
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

    const response = await this.apiService.get<{ data: Word[] }>(
      `/dictionary/categories/${categoryId}/words?limit=${limit}`
    );

    // Cache category words for 15 minutes
    await this.cacheService.set(cacheKey, response.data.data, 900);
    
    return response.data.data;
  }

  /**
   * Get recently added words
   */
  async getRecentWords(limit = 20, language?: string): Promise<Word[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (language) params.append('language', language);

    const cacheKey = `recent-words:${params.toString()}`;
    const cached = await this.cacheService.get<Word[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ data: Word[] }>(
      `/dictionary/words/recent?${params.toString()}`
    );

    // Cache recent words for 5 minutes
    await this.cacheService.set(cacheKey, response.data.data, 300);
    
    return response.data.data;
  }

  /**
   * Get popular/trending words
   */
  async getPopularWords(limit = 20, language?: string): Promise<Word[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (language) params.append('language', language);

    const cacheKey = `popular-words:${params.toString()}`;
    const cached = await this.cacheService.get<Word[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiService.get<{ data: Word[] }>(
      `/dictionary/words/popular?${params.toString()}`
    );

    // Cache popular words for 10 minutes
    await this.cacheService.set(cacheKey, response.data.data, 600);
    
    return response.data.data;
  }

  // ============ CONTRIBUTOR METHODS ============

  /**
   * Create new word (CONTRIBUTOR+)
   */
  async createWord(data: CreateWordData): Promise<Word> {
    // Validate required fields
    if (!data.word || !data.language || !data.definition || !data.category) {
      throw new Error('Word, language, definition, and category are required');
    }

    const formData = new FormData();
    
    // Add text fields
    formData.append('word', data.word);
    formData.append('language', data.language);
    formData.append('definition', data.definition);
    formData.append('category', data.category);
    
    if (data.pronunciation) formData.append('pronunciation', data.pronunciation);
    if (data.etymology) formData.append('etymology', data.etymology);
    if (data.partOfSpeech) formData.append('partOfSpeech', data.partOfSpeech);
    if (data.difficulty) formData.append('difficulty', data.difficulty);
    
    if (data.examples && data.examples.length > 0) {
      formData.append('examples', JSON.stringify(data.examples));
    }
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    
    // Add audio file if present
    if (data.audioFile) {
      formData.append('audioFile', data.audioFile as any);
    }

    const response = await this.apiService.post<Word>('/dictionary/words', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
    if (data.word) formData.append('word', data.word);
    if (data.language) formData.append('language', data.language);
    if (data.definition) formData.append('definition', data.definition);
    if (data.category) formData.append('category', data.category);
    if (data.pronunciation) formData.append('pronunciation', data.pronunciation);
    if (data.etymology) formData.append('etymology', data.etymology);
    if (data.partOfSpeech) formData.append('partOfSpeech', data.partOfSpeech);
    if (data.difficulty) formData.append('difficulty', data.difficulty);
    
    if (data.examples && data.examples.length > 0) {
      formData.append('examples', JSON.stringify(data.examples));
    }
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    
    if (data.audioFile) {
      formData.append('audioFile', data.audioFile as any);
    }

    const response = await this.apiService.put<Word>(`/dictionary/words/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
  async uploadWordAudio(wordId: string, audioFile: File): Promise<{ audioUrl: string }> {
    const formData = new FormData();
    formData.append('audioFile', audioFile as any);

    const response = await this.apiService.post<{ audioUrl: string }>(
      `/dictionary/words/${wordId}/audio`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
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
  async createCategory(data: Omit<Category, 'id' | 'wordCount'>): Promise<Category> {
    const response = await this.apiService.post<Category>('/dictionary/categories', data);

    // Clear categories cache
    this.cacheService.delete('categories');
    this.cacheService.delete(`categories:${data.language}`);
    
    return response.data;
  }

  /**
   * Propose new language (CONTRIBUTOR+)
   */
  async proposeLanguage(data: Omit<Language, 'id' | 'status'>): Promise<Language> {
    const response = await this.apiService.post<Language>('/dictionary/languages', data);

    // Clear languages cache
    this.cacheService.delete('languages');
    
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
      ? `/dictionary/stats/contributions/${userId}`
      : '/dictionary/stats/contributions';

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
    }>('/dictionary/admin/pending');

    return response.data;
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Clear word-related caches when words are modified
   */
  private async clearWordCaches(language?: string, category?: string): Promise<void> {
    // Clear general caches
    this.cacheService.delete('recent-words:limit=20');
    this.cacheService.delete('popular-words:limit=20');
    
    if (language) {
      this.cacheService.delete(`recent-words:limit=20&language=${language}`);
      this.cacheService.delete(`popular-words:limit=20&language=${language}`);
    }
    
    if (category) {
      // Clear category-specific caches by iterating through keys
      const keys = this.cacheService.keys();
      keys.forEach(key => {
        if (key.startsWith(`category-words:${category}:`)) {
          this.cacheService.delete(key);
        }
      });
    }
    
    // Clear search and suggestion caches by iterating through keys
    const keys = this.cacheService.keys();
    keys.forEach(key => {
      if (key.startsWith('search:') || key.startsWith('suggestions:')) {
        this.cacheService.delete(key);
      }
    });
  }
}