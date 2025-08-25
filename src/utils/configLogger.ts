/**
 * @fileoverview Configuration Logger Utility
 * Helps debug environment configuration issues
 */

import { environment } from '../config/environment';

/**
 * Log current environment configuration
 * Useful for debugging API connection issues
 */
export const logEnvironmentConfig = () => {
  if (__DEV__) {
    console.log('\n🔧 [Config] Environment Configuration:');
    console.log(`📍 API URL: ${environment.apiUrl}`);
    console.log(`🔌 WebSocket URL: ${environment.websocketUrl}`);
    console.log(`🏷️  Environment: ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📊 Logging: ${environment.enableLogging ? 'ENABLED' : 'DISABLED'}`);
    console.log(`⏱️  Timeout: ${environment.timeout}ms`);
    console.log('📋 Environment Variables:');
    console.log(`   EXPO_PUBLIC_API_URL: ${process.env.EXPO_PUBLIC_API_URL || 'undefined'}`);
    console.log(`   EXPO_PUBLIC_WEBSOCKET_URL: ${process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'undefined'}`);
    console.log(`   __DEV__: ${__DEV__}`);
    console.log('─'.repeat(50));
  }
};

/**
 * Test API connectivity
 */
export const testApiConnectivity = async () => {
  if (__DEV__) {
    try {
      console.log(`🔍 [Config] Testing API connectivity to: ${environment.apiUrl}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${environment.apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ [Config] API is reachable');
        const data = await response.json();
        console.log('📊 [Config] API Response:', data);
      } else {
        console.log(`❌ [Config] API returned status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ [Config] API connectivity test failed:', errorMessage);
      console.log('💡 [Config] This is normal if the API doesn\'t have a /health endpoint');
    }
  }
};