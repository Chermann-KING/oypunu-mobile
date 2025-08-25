/**
 * @fileoverview Authentication Hooks
 * Follows SOLID principles - Single Responsibility for auth logic
 * Uses Dependency Inversion - depends on IAuthService interface
 */

import { useCallback, useEffect } from 'react';
import { useAuthStoreState, useAuthStoreActions, useAuthPermissions } from '../stores/authStore';
import { useServices } from '../providers/ServiceProvider';
import { LoginCredentials, RegisterData } from '../interfaces/IAuthService';
import { User } from '../../types';

/**
 * Main authentication hook
 * Provides all auth functionality with automatic state management
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, tokens } = useAuthStoreState();
  const { login: setLogin, logout: setLogout, updateUser, setLoading, setError, clearError } = useAuthStoreActions();
  const permissions = useAuthPermissions();
  const { apiService, storageService, cacheService } = useServices();

  // Create AuthService instance with injected dependencies (DIP)
  const authService = useCallback(() => {
    const { createAuthService } = require('../services/AuthService');
    return createAuthService(apiService, storageService, cacheService);
  }, [apiService, storageService, cacheService]);

  // 🔧 CORRECTIF: Initialiser l'ApiService avec le token au démarrage si l'utilisateur est connecté
  useEffect(() => {
    console.log('[useAuth] Initializing auth state...', { 
      isAuthenticated, 
      hasTokens: !!tokens,
      accessToken: tokens?.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'None' 
    });

    if (isAuthenticated && tokens?.accessToken) {
      console.log('[useAuth] Restoring auth token to ApiService');
      apiService.setAuthToken(tokens.accessToken);
    } else {
      console.log('[useAuth] No auth token to restore');
    }
  }, [isAuthenticated, tokens, apiService]);

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    clearError();
    
    try {
      const authResult = await authService().login(credentials);
      setLogin(authResult.user, authResult.tokens);
      return authResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, setLogin, setLoading, setError, clearError]);

  /**
   * Register function
   */
  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    clearError();
    
    try {
      const authResult = await authService().register(data);
      setLogin(authResult.user, authResult.tokens);
      return authResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, setLogin, setLoading, setError, clearError]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authService().logout();
      // Clear auth token from API service
      apiService.clearAuthToken();
      setLogout();
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
      // Force logout even if backend call fails
      // Clear auth token from API service
      apiService.clearAuthToken();
      setLogout();
    } finally {
      setLoading(false);
    }
  }, [authService, apiService, setLogout, setLoading]);

  /**
   * Update profile function
   */
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    setLoading(true);
    clearError();
    
    try {
      const updatedUser = await authService().updateProfile(userData);
      updateUser(updatedUser);
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, updateUser, setLoading, setError, clearError]);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setLoading(true);
    clearError();
    
    try {
      await authService().requestPasswordReset(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de réinitialisation';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, setLoading, setError, clearError]);

  /**
   * Verify email
   */
  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    clearError();
    
    try {
      await authService().verifyEmail(token);
      // Update user's emailVerified status
      if (user) {
        updateUser({ emailVerified: true });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, user, updateUser, setLoading, setError, clearError]);

  /**
   * Change password
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    clearError();
    
    try {
      await authService().changePassword(currentPassword, newPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de changement de mot de passe';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, setLoading, setError, clearError]);

  /**
   * Social authentication
   */
  const socialLogin = useCallback(async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoading(true);
    clearError();
    
    try {
      const authResult = await authService().socialAuth(provider);
      setLogin(authResult.user, authResult.tokens);
      return authResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Erreur de connexion ${provider}`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, setLogin, setLoading, setError, clearError]);

  /**
   * Initialize auth state on app start
   */
  const initializeAuth = useCallback(async () => {
    setLoading(true);
    
    try {
      const authStatus = await authService().getAuthStatus();
      
      if (authStatus.isAuthenticated && authStatus.user && authStatus.tokens) {
        // Set auth token in API service for authenticated requests
        apiService.setAuthToken(authStatus.tokens.accessToken);
        setLogin(authStatus.user, authStatus.tokens);
      } else {
        // Clear any leftover token and ensure guest state
        apiService.clearAuthToken();
        setLogout();
      }
    } catch (error) {
      console.error('[useAuth] Initialize error:', error);
      // Clear any leftover token and ensure guest state
      apiService.clearAuthToken();
      setLogout();
    } finally {
      setLoading(false);
    }
  }, [authService, apiService, setLogin, setLogout, setLoading]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Permissions
    ...permissions,
    
    // Actions
    login,
    register,
    logout,
    socialLogin,
    updateProfile,
    requestPasswordReset,
    verifyEmail,
    changePassword,
    clearError,
    initializeAuth,
  };
};

/**
 * Hook for authentication actions only
 * Useful for components that only need to trigger auth actions
 */
export const useAuthActions = () => {
  const { 
    login, 
    register, 
    logout,
    socialLogin,
    updateProfile, 
    requestPasswordReset, 
    verifyEmail, 
    changePassword,
    clearError,
    initializeAuth 
  } = useAuth();

  return {
    login,
    register,
    logout,
    socialLogin,
    updateProfile,
    requestPasswordReset,
    verifyEmail,
    changePassword,
    clearError,
    initializeAuth,
  };
};

/**
 * Hook for authentication status only
 * Useful for components that only need to check auth state
 */
export const useAuthStatus = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const permissions = useAuthPermissions();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    ...permissions,
  };
};

/**
 * Hook to initialize authentication on app start
 * Should be called once in the root component
 */
export const useAuthInitialization = () => {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
};

/**
 * Service initialization function for app startup
 */
export const initializeServices = async (): Promise<void> => {
  console.log('[Services] Initializing core services...');
  
  try {
    // Log environment configuration for debugging
    const { logEnvironmentConfig } = require('../../utils/configLogger');
    logEnvironmentConfig();
    
    // Services are created lazily by ServiceProvider
    // This function ensures early initialization if needed
    console.log('[Services] Core services initialized successfully');
  } catch (error) {
    console.error('[Services] Failed to initialize services:', error);
    throw error;
  }
};