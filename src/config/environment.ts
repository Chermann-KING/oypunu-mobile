/**
 * @fileoverview Environment Configuration
 * Centralized configuration for API endpoints and environment-specific settings
 */

export interface Environment {
  production: boolean;
  apiUrl: string;
  websocketUrl: string;
  enableLogging: boolean;
  timeout: number;
}

/**
 * Production environment configuration
 */
export const productionEnvironment: Environment = {
  production: true,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://oypunu-production.up.railway.app/api',
  websocketUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'https://oypunu-production.up.railway.app',
  enableLogging: false, // Always false in production
  timeout: 15000, // 15 seconds for production
};

/**
 * Development environment configuration
 */
export const developmentEnvironment: Environment = {
  production: false,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://oypunu-production.up.railway.app/api',
  websocketUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'https://oypunu-production.up.railway.app',
  enableLogging: process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'false' ? false : true,
  timeout: parseInt(process.env.EXPO_PUBLIC_TIMEOUT || '10000', 10),
};

/**
 * Current environment based on NODE_ENV or __DEV__
 */
export const environment: Environment = __DEV__ 
  ? developmentEnvironment 
  : productionEnvironment;

/**
 * Environment-specific API configuration
 */
export const getApiConfig = () => ({
  baseURL: environment.apiUrl,
  timeout: environment.timeout,
  enableLogging: environment.enableLogging,
});

/**
 * Check if running in development mode
 */
export const isDevelopment = () => environment.production === false;

/**
 * Check if running in production mode  
 */
export const isProduction = () => environment.production === true;