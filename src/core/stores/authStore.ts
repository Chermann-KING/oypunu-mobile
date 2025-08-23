/**
 * @fileoverview Authentication Store
 * Follows SOLID principles - Single Responsibility for auth state
 * Uses Zustand for simple, performant state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types';
import { AuthTokens } from '../interfaces/IAuthService';
import { STORAGE_KEYS } from '../interfaces/IStorageService';

/**
 * Authentication state interface
 * Follows ISP - Only auth-related state
 */
export interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Combined actions
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  
  // Utility getters
  isGuest: () => boolean;
  isUser: () => boolean;
  isContributor: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canContribute: () => boolean;
  canModerate: () => boolean;
}

/**
 * Initial state
 */
const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Authentication store implementation
 * Follows SRP - Only manages authentication state
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Combined actions
      login: (user, tokens) => {
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          ...initialState,
          isLoading: false, // Keep loading false after logout
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      clearError: () => set({ error: null }),

      // Utility getters
      isGuest: () => !get().isAuthenticated,
      
      isUser: () => {
        const user = get().user;
        return user?.role === 'user' || false;
      },
      
      isContributor: () => {
        const user = get().user;
        return ['contributor', 'admin', 'superadmin'].includes(user?.role || '');
      },
      
      isAdmin: () => {
        const user = get().user;
        return ['admin', 'superadmin'].includes(user?.role || '');
      },
      
      isSuperAdmin: () => {
        const user = get().user;
        return user?.role === 'superadmin' || false;
      },
      
      canContribute: () => {
        const user = get().user;
        return ['contributor', 'admin', 'superadmin'].includes(user?.role || '');
      },
      
      canModerate: () => {
        const user = get().user;
        return ['admin', 'superadmin'].includes(user?.role || '');
      },
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      // Don't persist loading states and errors
      skipHydration: false,
      // Version for migration support
      version: 1,
    }
  )
);

/**
 * Utility hooks for specific auth checks
 */

export const useAuthStoreState = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

export const useAuthStoreActions = () => {
  const { 
    login, 
    logout, 
    updateUser, 
    setLoading, 
    setError, 
    clearError 
  } = useAuthStore();
  
  return { 
    login, 
    logout, 
    updateUser, 
    setLoading, 
    setError, 
    clearError 
  };
};

export const useAuthPermissions = () => {
  const {
    isGuest,
    isUser,
    isContributor,
    isAdmin,
    isSuperAdmin,
    canContribute,
    canModerate,
  } = useAuthStore();
  
  return {
    isGuest: isGuest(),
    isUser: isUser(),
    isContributor: isContributor(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    canContribute: canContribute(),
    canModerate: canModerate(),
  };
};

/**
 * Token management utilities
 */
export const useTokens = () => {
  const { tokens, setTokens } = useAuthStore();
  
  const isTokenExpired = () => {
    if (!tokens) return true;
    
    // Check if token expires soon (within 5 minutes)
    const expirationTime = Date.now() + (tokens.expiresIn * 1000);
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    
    return expirationTime < fiveMinutesFromNow;
  };
  
  const getAuthHeader = () => {
    if (!tokens) return null;
    return `${tokens.tokenType} ${tokens.accessToken}`;
  };
  
  return {
    tokens,
    setTokens,
    isTokenExpired,
    getAuthHeader,
  };
};