/**
 * @fileoverview Dictionary Store
 * Follows SOLID principles - Single Responsibility for dictionary state
 * Separated from favorites store (SRP)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../../types';
import { SearchFilters, SearchResult, Category, Language } from '../interfaces/IDictionaryService';
import { STORAGE_KEYS } from '../interfaces/IStorageService';

/**
 * Dictionary state interface
 * Follows ISP - Only dictionary-related state
 */
export interface DictionaryState {
  // Search state
  searchResults: Word[];
  searchQuery: string;
  searchFilters: SearchFilters;
  searchHistory: string[];
  isSearching: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  totalResults: number;
  
  // Current word state
  currentWord: Word | null;
  isLoadingWord: boolean;
  wordError: string | null;
  
  // Categories and languages
  categories: Category[];
  languages: Language[];
  isLoadingCategories: boolean;
  isLoadingLanguages: boolean;
  
  // Discovery
  recentWords: Word[];
  popularWords: Word[];
  randomWords: Word[];
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setSearching: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  
  // Word actions
  setCurrentWord: (word: Word | null) => void;
  setLoadingWord: (loading: boolean) => void;
  setWordError: (error: string | null) => void;
  
  // Categories and languages actions
  setCategories: (categories: Category[]) => void;
  setLanguages: (languages: Language[]) => void;
  setLoadingCategories: (loading: boolean) => void;
  setLoadingLanguages: (loading: boolean) => void;
  
  // Discovery actions
  setRecentWords: (words: Word[]) => void;
  setPopularWords: (words: Word[]) => void;
  setRandomWords: (words: Word[]) => void;
  
  // Utility actions
  clearAll: () => void;
  clearErrors: () => void;
  
  // Getters
  getFilteredCategories: (languageId?: string) => Category[];
  getRecentSearches: (limit?: number) => string[];
}

/**
 * Initial state
 */
const initialState = {
  // Search
  searchResults: [],
  searchQuery: '',
  searchFilters: {},
  searchHistory: [],
  isSearching: false,
  searchError: null,
  hasMoreResults: false,
  totalResults: 0,
  
  // Current word
  currentWord: null,
  isLoadingWord: false,
  wordError: null,
  
  // Categories and languages
  categories: [],
  languages: [],
  isLoadingCategories: false,
  isLoadingLanguages: false,
  
  // Discovery
  recentWords: [],
  popularWords: [],
  randomWords: [],
};

/**
 * Dictionary store implementation
 * Follows SRP - Only manages dictionary-related state
 */
export const useDictionaryStore = create<DictionaryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Search actions
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      
      setSearchResults: (result) => set({
        searchResults: result.words,
        hasMoreResults: result.hasMore,
        totalResults: result.total,
        isSearching: false,
        searchError: null,
      }),
      
      setSearchFilters: (searchFilters) => set({ searchFilters }),
      
      addToSearchHistory: (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        
        const currentHistory = get().searchHistory;
        // Remove if already exists and add to beginning
        const newHistory = [
          trimmedQuery,
          ...currentHistory.filter(item => item !== trimmedQuery)
        ].slice(0, 20); // Keep only last 20 searches
        
        set({ searchHistory: newHistory });
      },
      
      clearSearchHistory: () => set({ searchHistory: [] }),
      setSearching: (isSearching) => set({ isSearching }),
      setSearchError: (searchError) => set({ searchError }),

      // Word actions
      setCurrentWord: (currentWord) => set({ currentWord }),
      setLoadingWord: (isLoadingWord) => set({ isLoadingWord }),
      setWordError: (wordError) => set({ wordError }),

      // Categories and languages actions
      setCategories: (categories) => set({ categories }),
      setLanguages: (languages) => set({ languages }),
      setLoadingCategories: (isLoadingCategories) => set({ isLoadingCategories }),
      setLoadingLanguages: (isLoadingLanguages) => set({ isLoadingLanguages }),

      // Discovery actions
      setRecentWords: (recentWords) => set({ recentWords }),
      setPopularWords: (popularWords) => set({ popularWords }),
      setRandomWords: (randomWords) => set({ randomWords }),

      // Utility actions
      clearAll: () => set(initialState),
      
      clearErrors: () => set({ 
        searchError: null, 
        wordError: null 
      }),

      // Getters
      getFilteredCategories: (languageId) => {
        const categories = get().categories;
        if (!languageId) return categories;
        return categories.filter(cat => cat.language === languageId);
      },
      
      getRecentSearches: (limit = 10) => {
        return get().searchHistory.slice(0, limit);
      },
    }),
    {
      name: STORAGE_KEYS.SEARCH_HISTORY,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist search history and filters
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        searchFilters: state.searchFilters,
      }),
      version: 1,
    }
  )
);

/**
 * Specialized hooks for different aspects of dictionary state
 */

export const useSearch = () => {
  const {
    searchResults,
    searchQuery,
    searchFilters,
    isSearching,
    searchError,
    hasMoreResults,
    totalResults,
    setSearchQuery,
    setSearchResults,
    setSearchFilters,
    setSearching,
    setSearchError,
  } = useDictionaryStore();
  
  return {
    searchResults,
    searchQuery,
    searchFilters,
    isSearching,
    searchError,
    hasMoreResults,
    totalResults,
    setSearchQuery,
    setSearchResults,
    setSearchFilters,
    setSearching,
    setSearchError,
  };
};

export const useSearchHistory = () => {
  const {
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    getRecentSearches,
  } = useDictionaryStore();
  
  return {
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    getRecentSearches,
  };
};

export const useCurrentWord = () => {
  const {
    currentWord,
    isLoadingWord,
    wordError,
    setCurrentWord,
    setLoadingWord,
    setWordError,
  } = useDictionaryStore();
  
  return {
    currentWord,
    isLoadingWord,
    wordError,
    setCurrentWord,
    setLoadingWord,
    setWordError,
  };
};

export const useDictionaryData = () => {
  const {
    categories,
    languages,
    isLoadingCategories,
    isLoadingLanguages,
    setCategories,
    setLanguages,
    setLoadingCategories,
    setLoadingLanguages,
    getFilteredCategories,
  } = useDictionaryStore();
  
  return {
    categories,
    languages,
    isLoadingCategories,
    isLoadingLanguages,
    setCategories,
    setLanguages,
    setLoadingCategories,
    setLoadingLanguages,
    getFilteredCategories,
  };
};

export const useDiscovery = () => {
  const {
    recentWords,
    popularWords,
    randomWords,
    setRecentWords,
    setPopularWords,
    setRandomWords,
  } = useDictionaryStore();
  
  return {
    recentWords,
    popularWords,
    randomWords,
    setRecentWords,
    setPopularWords,
    setRandomWords,
  };
};