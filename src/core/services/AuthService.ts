/**
 * @fileoverview Authentication Service Implementation
 * Follows SOLID principles - Single Responsibility for authentication
 * Implements IAuthService interface (DIP)
 */

import { 
  IAuthService, 
  IApiService, 
  IStorageService,
  ICacheService,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResult,
  ResetPasswordData,
  SocialAuthResult,
  STORAGE_KEYS,
  CACHE_KEYS
} from '../interfaces';
import { User } from '../../types';

/**
 * Concrete implementation of IAuthService
 * Follows SRP - Only responsible for authentication operations
 * Uses DIP - Depends on abstractions (interfaces)
 */
export class AuthService implements IAuthService {
  constructor(
    private apiService: IApiService,
    private storageService: IStorageService,
    private cacheService: ICacheService
  ) {}

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await this.apiService.post<AuthResult>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const authResult = response.data;
      
      // Transform API response to match our interface
      const normalizedTokens = this.normalizeTokens(authResult.tokens);
      
      // Store tokens securely
      await this.storeTokens(normalizedTokens);
      
      // Store user data
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, authResult.user);
      
      // Set auth token in API service for future requests
      this.apiService.setAuthToken(normalizedTokens.accessToken);
      
      // Cache user data for quick access
      this.cacheService.set(CACHE_KEYS.USER_FAVORITES, authResult.user, 3600000); // 1 hour
      
      // Return normalized result
      const normalizedAuthResult = {
        ...authResult,
        tokens: normalizedTokens,
      };
      
      this.log('LOGIN_SUCCESS', credentials.email);
      return normalizedAuthResult;
    } catch (error) {
      this.log('LOGIN_ERROR', credentials.email, error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const response = await this.apiService.post<AuthResult>('/auth/register', {
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });

      const authResult = response.data;
      
      // Transform API response to match our interface
      const normalizedTokens = this.normalizeTokens(authResult.tokens);
      
      // Store tokens and user data (same as login)
      await this.storeTokens(normalizedTokens);
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, authResult.user);
      this.apiService.setAuthToken(normalizedTokens.accessToken);
      
      // Return normalized result
      const normalizedAuthResult = {
        ...authResult,
        tokens: normalizedTokens,
      };
      
      this.log('REGISTER_SUCCESS', data.email);
      return normalizedAuthResult;
    } catch (error) {
      this.log('REGISTER_ERROR', data.email, error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout (no body needed, auth header is sufficient)
      await this.apiService.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if backend call fails
      console.warn('[AuthService] Backend logout failed:', error);
    }

    // Clear all stored data
    await this.clearStoredAuth();
    
    // Clear API auth token
    this.apiService.clearAuthToken();
    
    // Clear cached user data
    this.cacheService.delete(CACHE_KEYS.USER_FAVORITES);
    
    this.log('LOGOUT_SUCCESS');
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.apiService.post<{ tokens: AuthTokens }>('/auth/refresh', {
        refreshToken,
      });

      const newTokens = response.data.tokens;
      
      // Store new tokens
      await this.storeTokens(newTokens);
      
      // Update API service with new access token
      this.apiService.setAuthToken(newTokens.accessToken);
      
      this.log('REFRESH_SUCCESS');
      return newTokens;
    } catch (error) {
      this.log('REFRESH_ERROR', '', error);
      
      // If refresh fails, clear all auth data
      await this.clearStoredAuth();
      this.apiService.clearAuthToken();
      
      throw this.transformAuthError(error);
    }
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.apiService.post('/auth/forgot-password', { email });
      this.log('PASSWORD_RESET_REQUEST', email);
    } catch (error) {
      this.log('PASSWORD_RESET_REQUEST_ERROR', email, error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await this.apiService.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      this.log('PASSWORD_RESET_SUCCESS');
    } catch (error) {
      this.log('PASSWORD_RESET_ERROR', '', error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await this.apiService.post('/auth/verify-email', { token });
      
      // Update stored user data to reflect verified status
      const userData = await this.storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
      if (userData) {
        userData.emailVerified = true;
        await this.storageService.setItem(STORAGE_KEYS.USER_DATA, userData);
      }
      
      this.log('EMAIL_VERIFY_SUCCESS');
    } catch (error) {
      this.log('EMAIL_VERIFY_ERROR', token, error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    try {
      await this.apiService.post('/auth/resend-verification');
      this.log('RESEND_VERIFICATION_SUCCESS');
    } catch (error) {
      this.log('RESEND_VERIFICATION_ERROR', '', error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Authenticate with social provider
   */
  async socialAuth(provider: 'google' | 'facebook' | 'twitter'): Promise<AuthResult> {
    try {
      // Import SocialAuthService dynamically to avoid circular dependencies
      const { SocialAuthService } = require('./SocialAuthService');
      const socialAuthService = new SocialAuthService();
      
      this.log('SOCIAL_AUTH_START', provider);
      
      // Perform OAuth flow with the social provider
      const socialResult = await socialAuthService.authenticateWith(provider);
      
      // Send social auth data to our backend
      const response = await this.apiService.post<AuthResult>(`/auth/social/${provider}`, {
        accessToken: socialResult.accessToken,
        userInfo: socialResult.userInfo,
      });

      const authResult = response.data;
      
      // Transform API response to match our interface
      const normalizedTokens = this.normalizeTokens(authResult.tokens);
      
      // Store tokens and user data (same as login)
      await this.storeTokens(normalizedTokens);
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, authResult.user);
      this.apiService.setAuthToken(normalizedTokens.accessToken);
      
      // Cache user data for quick access
      this.cacheService.set(CACHE_KEYS.USER_FAVORITES, authResult.user, 3600000); // 1 hour
      
      // Return normalized result
      const normalizedAuthResult = {
        ...authResult,
        tokens: normalizedTokens,
      };
      
      this.log('SOCIAL_AUTH_SUCCESS', provider);
      return normalizedAuthResult;
    } catch (error) {
      this.log('SOCIAL_AUTH_ERROR', provider, error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    tokens: AuthTokens | null;
  }> {
    try {
      const user = await this.storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
      const tokens = await this.getStoredTokens();
      
      const isAuthenticated = !!(user && tokens && this.isTokenValid(tokens));
      
      // If tokens are expired, try to refresh
      if (user && tokens && !this.isTokenValid(tokens)) {
        try {
          const newTokens = await this.refreshToken();
          return {
            isAuthenticated: true,
            user,
            tokens: newTokens,
          };
        } catch (error) {
          // Refresh failed, user needs to log in again
          return {
            isAuthenticated: false,
            user: null,
            tokens: null,
          };
        }
      }
      
      return {
        isAuthenticated,
        user,
        tokens,
      };
    } catch (error) {
      this.log('AUTH_STATUS_ERROR', '', error);
      return {
        isAuthenticated: false,
        user: null,
        tokens: null,
      };
    }
  }

  /**
   * Check if current session is valid
   */
  async validateSession(): Promise<boolean> {
    try {
      const authStatus = await this.getAuthStatus();
      
      if (!authStatus.isAuthenticated) {
        return false;
      }

      // Validate with backend
      const response = await this.apiService.get('/auth/validate');
      return response.status === 200;
    } catch (error) {
      this.log('SESSION_VALIDATION_ERROR', '', error);
      return false;
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      this.log('PASSWORD_CHANGE_SUCCESS');
    } catch (error) {
      this.log('PASSWORD_CHANGE_ERROR', '', error);
      throw this.transformAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await this.apiService.put<User>('/auth/profile', userData);
      const updatedUser = response.data;
      
      // Update stored user data
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
      
      // Update cached user data
      this.cacheService.set(CACHE_KEYS.USER_FAVORITES, updatedUser, 3600000);
      
      this.log('PROFILE_UPDATE_SUCCESS');
      return updatedUser;
    } catch (error) {
      this.log('PROFILE_UPDATE_ERROR', '', error);
      throw this.transformAuthError(error);
    }
  }

  // Private helper methods

  /**
   * Normalize API token response to match our interface
   */
  private normalizeTokens(apiTokens: any): AuthTokens {
    return {
      accessToken: apiTokens.access_token || apiTokens.accessToken,
      refreshToken: apiTokens.refresh_token || apiTokens.refreshToken,
      expiresIn: apiTokens.expiresIn || 900, // Default 15 minutes
      tokenType: apiTokens.tokenType || 'Bearer',
    };
  }

  /**
   * Store authentication tokens securely
   */
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await this.storageService.setMultiple({
      [STORAGE_KEYS.AUTH_TOKEN]: tokens.accessToken,
      [STORAGE_KEYS.REFRESH_TOKEN]: tokens.refreshToken,
    });
  }

  /**
   * Get stored authentication tokens
   */
  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokenData = await this.storageService.getMultiple([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      const accessToken = tokenData[STORAGE_KEYS.AUTH_TOKEN];
      const refreshToken = tokenData[STORAGE_KEYS.REFRESH_TOKEN];

      // Check if tokens are valid strings (not empty objects or null)
      if (!accessToken || !refreshToken || typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresIn: 900, // Default 15 minutes
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('[AuthService] Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  private async getStoredRefreshToken(): Promise<string | null> {
    return await this.storageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all stored authentication data
   */
  private async clearStoredAuth(): Promise<void> {
    await Promise.all([
      this.storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      this.storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      this.storageService.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
  }

  /**
   * Check if token is valid (not expired)
   */
  private isTokenValid(tokens: AuthTokens): boolean {
    // This is a simplified check. In production, you'd decode the JWT
    // and check the actual expiration time
    return true; // For now, assume tokens are valid
  }

  /**
   * Transform API errors to user-friendly messages
   */
  private transformAuthError(error: any): Error {
    if (error?.status === 401) {
      return new Error('Email ou mot de passe incorrect');
    }
    if (error?.status === 409) {
      return new Error('Un compte existe déjà avec cet email');
    }
    if (error?.status === 422) {
      return new Error('Données invalides. Vérifiez vos informations');
    }
    if (error?.status === 429) {
      return new Error('Trop de tentatives. Réessayez plus tard');
    }
    
    return new Error(error?.message || 'Une erreur est survenue');
  }

  /**
   * Log authentication operations
   */
  private log(operation: string, identifier?: string, error?: any): void {
    if (__DEV__) {
      const logData = {
        operation,
        identifier,
        timestamp: new Date().toISOString(),
        ...(error && { error: error.message }),
      };
      console.log(`[AuthService] ${operation}:`, logData);
    }
  }
}

/**
 * Factory function to create AuthService with dependencies
 */
export const createAuthService = (
  apiService: IApiService,
  storageService: IStorageService,
  cacheService: ICacheService
): IAuthService => {
  return new AuthService(apiService, storageService, cacheService);
};