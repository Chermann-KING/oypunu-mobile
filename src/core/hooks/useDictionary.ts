/**
 * @fileoverview Dictionary Hook
 * Follows SOLID principles - Interface Segregation for dictionary operations
 */

import { useCallback } from 'react';
import { Word } from '../../types';
import { 
  SearchOptions, 
  SearchFilters, 
  CreateWordData, 
  Category, 
  Language 
} from '../interfaces/IDictionaryService';
import { 
  useSearch, 
  useSearchHistory, 
  useCurrentWord, 
  useDictionaryData, 
  useDiscovery 
} from '../stores/dictionaryStore';
import { useServiceProvider } from '../providers/ServiceProvider';

/**
 * Main dictionary hook
 * Provides high-level dictionary operations
 */
export const useDictionary = () => {
  const serviceProvider = useServiceProvider();
  const dictionaryService = serviceProvider.dictionaryService;
  
  // Store hooks
  const searchHook = useSearch();
  const historyHook = useSearchHistory();
  const wordHook = useCurrentWord();
  const dataHook = useDictionaryData();
  const discoveryHook = useDiscovery();

  // ============ SEARCH OPERATIONS ============

  const searchWords = useCallback(async (options: SearchOptions) => {
    searchHook.setSearching(true);
    searchHook.setSearchError(null);
    
    try {
      const result = await dictionaryService.searchWords(options);
      searchHook.setSearchResults(result);
      
      // Add to search history if it's a meaningful query
      if (options.query.trim().length > 1) {
        historyHook.addToSearchHistory(options.query);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de recherche';
      searchHook.setSearchError(errorMessage);
      throw error;
    } finally {
      searchHook.setSearching(false);
    }
  }, [dictionaryService, searchHook, historyHook]);

  const loadMoreResults = useCallback(async (options: SearchOptions, currentResults: Word[]) => {
    try {
      const result = await dictionaryService.searchWords({
        ...options,
        offset: currentResults.length,
      });
      
      // Append new results to existing ones
      const combinedResult = {
        ...result,
        words: [...currentResults, ...result.words],
      };
      
      searchHook.setSearchResults(combinedResult);
      return combinedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement';
      searchHook.setSearchError(errorMessage);
      throw error;
    }
  }, [dictionaryService, searchHook]);

  const getWordSuggestions = useCallback(async (partial: string, language?: string) => {
    try {
      return await dictionaryService.getWordSuggestions(partial, language);
    } catch (error) {
      console.error('Error getting word suggestions:', error);
      return [];
    }
  }, [dictionaryService]);

  const clearSearch = useCallback(() => {
    searchHook.setSearchQuery('');
    searchHook.setSearchResults({
      words: [],
      total: 0,
      hasMore: false,
      filters: { availableLanguages: [], availableCategories: [] }
    });
    searchHook.setSearchError(null);
  }, [searchHook]);

  // ============ WORD OPERATIONS ============

  const getWord = useCallback(async (id: string) => {
    wordHook.setLoadingWord(true);
    wordHook.setWordError(null);
    
    try {
      const word = await dictionaryService.getWordById(id);
      wordHook.setCurrentWord(word);
      return word;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement du mot';
      wordHook.setWordError(errorMessage);
      throw error;
    } finally {
      wordHook.setLoadingWord(false);
    }
  }, [dictionaryService, wordHook]);

  const clearCurrentWord = useCallback(() => {
    wordHook.setCurrentWord(null);
    wordHook.setWordError(null);
  }, [wordHook]);

  // ============ DISCOVERY OPERATIONS ============

  const loadRandomWords = useCallback(async (count?: number, language?: string) => {
    try {
      const words = await dictionaryService.getRandomWords(count, language);
      discoveryHook.setRandomWords(words);
      return words;
    } catch (error) {
      console.error('Error loading random words:', error);
      return [];
    }
  }, [dictionaryService, discoveryHook]);

  const loadRecentWords = useCallback(async (limit?: number, language?: string) => {
    try {
      const words = await dictionaryService.getRecentWords(limit, language);
      discoveryHook.setRecentWords(words);
      return words;
    } catch (error) {
      console.error('Error loading recent words:', error);
      return [];
    }
  }, [dictionaryService, discoveryHook]);

  const loadPopularWords = useCallback(async (limit?: number, language?: string) => {
    try {
      const words = await dictionaryService.getPopularWords(limit, language);
      discoveryHook.setPopularWords(words);
      return words;
    } catch (error) {
      console.error('Error loading popular words:', error);
      return [];
    }
  }, [dictionaryService, discoveryHook]);

  // ============ CATEGORIES & LANGUAGES ============

  const loadCategories = useCallback(async (language?: string) => {
    dataHook.setLoadingCategories(true);
    
    try {
      const categories = await dictionaryService.getCategories(language);
      dataHook.setCategories(categories);
      return categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    } finally {
      dataHook.setLoadingCategories(false);
    }
  }, [dictionaryService, dataHook]);

  const loadLanguages = useCallback(async () => {
    dataHook.setLoadingLanguages(true);
    
    try {
      const languages = await dictionaryService.getLanguages();
      dataHook.setLanguages(languages);
      return languages;
    } catch (error) {
      console.error('Error loading languages:', error);
      return [];
    } finally {
      dataHook.setLoadingLanguages(false);
    }
  }, [dictionaryService, dataHook]);

  const getCategory = useCallback(async (id: string) => {
    try {
      return await dictionaryService.getCategoryById(id);
    } catch (error) {
      console.error('Error loading category:', error);
      throw error;
    }
  }, [dictionaryService]);

  const getLanguage = useCallback(async (identifier: string) => {
    try {
      return await dictionaryService.getLanguage(identifier);
    } catch (error) {
      console.error('Error loading language:', error);
      throw error;
    }
  }, [dictionaryService]);

  const getWordsByCategory = useCallback(async (categoryId: string, limit?: number) => {
    try {
      return await dictionaryService.getWordsByCategory(categoryId, limit);
    } catch (error) {
      console.error('Error loading words by category:', error);
      return [];
    }
  }, [dictionaryService]);

  // ============ RETURN ALL OPERATIONS ============

  return {
    // Search
    ...searchHook,
    searchWords,
    loadMoreResults,
    getWordSuggestions,
    clearSearch,
    
    // Search history
    ...historyHook,
    
    // Current word
    ...wordHook,
    getWord,
    clearCurrentWord,
    
    // Discovery
    ...discoveryHook,
    loadRandomWords,
    loadRecentWords,
    loadPopularWords,
    
    // Categories & Languages
    ...dataHook,
    loadCategories,
    loadLanguages,
    getCategory,
    getLanguage,
    getWordsByCategory,
  };
};

/**
 * Contributor-specific dictionary hook
 * For users with CONTRIBUTOR+ role
 */
export const useDictionaryContributor = () => {
  const serviceProvider = useServiceProvider();
  const dictionaryService = serviceProvider.dictionaryService;

  const createWord = useCallback(async (data: CreateWordData) => {
    try {
      const word = await dictionaryService.createWord(data);
      return word;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de création du mot';
      console.error('Error creating word:', error);
      throw new Error(errorMessage);
    }
  }, [dictionaryService]);

  const updateWord = useCallback(async (id: string, data: Partial<CreateWordData>) => {
    try {
      const word = await dictionaryService.updateWord(id, data);
      return word;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour du mot';
      console.error('Error updating word:', error);
      throw new Error(errorMessage);
    }
  }, [dictionaryService]);

  const uploadWordAudio = useCallback(async (wordId: string, audioFile: File) => {
    try {
      const result = await dictionaryService.uploadWordAudio(wordId, audioFile);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'upload audio';
      console.error('Error uploading word audio:', error);
      throw new Error(errorMessage);
    }
  }, [dictionaryService]);

  const createCategory = useCallback(async (data: Omit<Category, 'id' | 'wordCount'>) => {
    try {
      const category = await dictionaryService.createCategory(data);
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de création de catégorie';
      console.error('Error creating category:', error);
      throw new Error(errorMessage);
    }
  }, [dictionaryService]);

  const proposeLanguage = useCallback(async (data: Omit<Language, 'id' | 'status'>) => {
    try {
      const language = await dictionaryService.proposeLanguage(data);
      return language;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de proposition de langue';
      console.error('Error proposing language:', error);
      throw new Error(errorMessage);
    }
  }, [dictionaryService]);

  const getContributionStats = useCallback(async (userId?: string) => {
    try {
      return await dictionaryService.getContributionStats(userId);
    } catch (error) {
      console.error('Error loading contribution stats:', error);
      throw error;
    }
  }, [dictionaryService]);

  return {
    createWord,
    updateWord,
    uploadWordAudio,
    createCategory,
    proposeLanguage,
    getContributionStats,
  };
};

/**
 * Admin-specific dictionary hook
 * For users with ADMIN+ role
 */
export const useDictionaryAdmin = () => {
  const serviceProvider = useServiceProvider();
  const dictionaryService = serviceProvider.dictionaryService;

  const getPendingContributions = useCallback(async () => {
    try {
      return await dictionaryService.getPendingContributions();
    } catch (error) {
      console.error('Error loading pending contributions:', error);
      throw error;
    }
  }, [dictionaryService]);

  return {
    getPendingContributions,
  };
};