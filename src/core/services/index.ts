// Core services exports following SOLID principles
// Single entry point for all service implementations

export * from './ApiService';
export * from './StorageService';
export * from './CacheService';
export * from './AuthService';
export * from './DictionaryService';
export { SocialAuthService, type OAuth2Result, type SocialProvider } from './SocialAuthService';

// Re-export interfaces for convenience
export * from '../interfaces';