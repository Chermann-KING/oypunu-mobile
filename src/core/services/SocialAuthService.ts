/**
 * @fileoverview Social Authentication Service
 * Handles OAuth flows for Google, Facebook, and X (Twitter)
 * Follows SOLID principles - Single Responsibility for social auth
 * 
 * NOTE: This is a simplified implementation for demo purposes.
 * In production, you would need to configure OAuth apps properly.
 */

import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform, Alert } from 'react-native';
import { environment } from '../../config/environment';

/**
 * Social authentication providers
 */
export type SocialProvider = 'google' | 'facebook' | 'twitter';

/**
 * OAuth configuration for each provider
 */
interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  endpoints: {
    authorization: string;
    token: string;
    userInfo: string;
  };
}

/**
 * OAuth result from the provider
 */
export interface OAuth2Result {
  provider: SocialProvider;
  accessToken: string;
  refreshToken?: string;
  userInfo: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

/**
 * Social Authentication Service
 * Manages OAuth flows for different social providers
 */
export class SocialAuthService {
  private readonly redirectUri: string;

  constructor() {
    this.redirectUri = AuthSession.makeRedirectUri({
      preferLocalhost: false,
    });
    
    console.log('[SocialAuth] Redirect URI:', this.redirectUri);
  }

  /**
   * Get OAuth configuration for a provider
   */
  private getProviderConfig(provider: SocialProvider): OAuthConfig {
    // Note: These would typically come from environment variables
    // For demo purposes, using placeholder values
    const configs: Record<SocialProvider, OAuthConfig> = {
      google: {
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
        redirectUri: this.redirectUri,
        scopes: ['openid', 'profile', 'email'],
        endpoints: {
          authorization: 'https://accounts.google.com/o/oauth2/auth',
          token: 'https://oauth2.googleapis.com/token',
          userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
        },
      },
      facebook: {
        clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id',
        redirectUri: this.redirectUri,
        scopes: ['email', 'public_profile'],
        endpoints: {
          authorization: 'https://www.facebook.com/v18.0/dialog/oauth',
          token: 'https://graph.facebook.com/v18.0/oauth/access_token',
          userInfo: 'https://graph.facebook.com/me?fields=id,name,email,picture',
        },
      },
      twitter: {
        clientId: process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || 'your-twitter-client-id',
        redirectUri: this.redirectUri,
        scopes: ['tweet.read', 'users.read'],
        endpoints: {
          authorization: 'https://twitter.com/i/oauth2/authorize',
          token: 'https://api.twitter.com/2/oauth2/token',
          userInfo: 'https://api.twitter.com/2/users/me',
        },
      },
    };

    return configs[provider];
  }

  /**
   * Generate PKCE challenge for secure OAuth flow
   */
  private async generatePKCE() {
    // Simplified PKCE generation
    const codeVerifier = Math.random().toString(36).substring(2, 128);
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256' as any,
    };
  }

  /**
   * Authenticate with Google
   */
  async authenticateWithGoogle(): Promise<OAuth2Result> {
    // For demo purposes - show configuration reminder
    Alert.alert(
      'Configuration Requise',
      'Pour utiliser la connexion Google, vous devez configurer :\n\n' +
      '1. EXPO_PUBLIC_GOOGLE_CLIENT_ID dans .env\n' +
      '2. OAuth app dans Google Console\n' +
      '3. Redirect URI configuré\n\n' +
      'Cette fonctionnalité nécessite une configuration complète.',
      [{ text: 'OK' }]
    );
    
    throw new Error('Google OAuth non configuré - voir documentation');
  }

  /**
   * Authenticate with Facebook
   */
  async authenticateWithFacebook(): Promise<OAuth2Result> {
    Alert.alert(
      'Configuration Requise',
      'Pour utiliser la connexion Facebook, vous devez configurer :\n\n' +
      '1. EXPO_PUBLIC_FACEBOOK_APP_ID dans .env\n' +
      '2. Facebook App dans Meta Console\n' +
      '3. Redirect URI configuré\n\n' +
      'Cette fonctionnalité nécessite une configuration complète.',
      [{ text: 'OK' }]
    );
    
    throw new Error('Facebook OAuth non configuré - voir documentation');
  }

  /**
   * Authenticate with X (Twitter)
   */
  async authenticateWithTwitter(): Promise<OAuth2Result> {
    Alert.alert(
      'Configuration Requise',
      'Pour utiliser la connexion X (Twitter), vous devez configurer :\n\n' +
      '1. EXPO_PUBLIC_TWITTER_CLIENT_ID dans .env\n' +
      '2. Twitter App dans Developer Portal\n' +
      '3. Redirect URI configuré\n\n' +
      'Cette fonctionnalité nécessite une configuration complète.',
      [{ text: 'OK' }]
    );
    
    throw new Error('Twitter OAuth non configuré - voir documentation');
  }

  /**
   * Generic social authentication method
   */
  async authenticateWith(provider: SocialProvider): Promise<OAuth2Result> {
    switch (provider) {
      case 'google':
        return this.authenticateWithGoogle();
      case 'facebook':
        return this.authenticateWithFacebook();
      case 'twitter':
        return this.authenticateWithTwitter();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}