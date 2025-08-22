/**
 * @fileoverview Authentication Service Interface
 * Follows SOLID principles - Single Responsibility for authentication
 */

import { User } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SocialAuthResult {
  provider: 'google' | 'facebook' | 'twitter';
  token: string;
  user: Partial<User>;
}

/**
 * Authentication service interface
 * Handles all authentication-related operations
 */
export interface IAuthService {
  /**
   * Authenticate user with email and password
   */
  login(credentials: LoginCredentials): Promise<AuthResult>;

  /**
   * Register new user account
   */
  register(data: RegisterData): Promise<AuthResult>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Promise<AuthTokens>;

  /**
   * Request password reset email
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Reset password with token
   */
  resetPassword(data: ResetPasswordData): Promise<void>;

  /**
   * Verify email with token
   */
  verifyEmail(token: string): Promise<void>;

  /**
   * Resend email verification
   */
  resendEmailVerification(): Promise<void>;

  /**
   * Authenticate with social provider
   */
  socialAuth(provider: 'google' | 'facebook' | 'twitter'): Promise<AuthResult>;

  /**
   * Get current authentication status
   */
  getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    tokens: AuthTokens | null;
  }>;

  /**
   * Check if current session is valid
   */
  validateSession(): Promise<boolean>;

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<User>): Promise<User>;
}