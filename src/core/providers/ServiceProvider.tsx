/**
 * @fileoverview Service Provider for Dependency Injection
 * Follows SOLID principles - Dependency Inversion Principle (DIP)
 * Provides all services through React Context
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  IApiService, 
  IStorageService, 
  ICacheService 
} from '../interfaces';
import { 
  ApiService, 
  StorageService, 
  CacheService,
  apiService,
  storageService,
  cacheService 
} from '../services';

/**
 * Service container interface
 * Follows Interface Segregation Principle (ISP)
 */
export interface ServiceContainer {
  apiService: IApiService;
  storageService: IStorageService;
  cacheService: ICacheService;
}

/**
 * Default service implementations
 * Using singleton instances for consistent state
 */
const defaultServices: ServiceContainer = {
  apiService,
  storageService,
  cacheService,
};

/**
 * Service Context for dependency injection
 */
const ServiceContext = createContext<ServiceContainer | null>(null);

/**
 * Props for ServiceProvider
 */
export interface ServiceProviderProps {
  children: ReactNode;
  services?: Partial<ServiceContainer>; // Allow overriding services for testing
}

/**
 * Service Provider Component
 * Provides all core services to the application
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  services = {} 
}) => {
  // Merge provided services with defaults
  const serviceContainer: ServiceContainer = {
    ...defaultServices,
    ...services,
  };

  return (
    <ServiceContext.Provider value={serviceContainer}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to access the service container
 * Throws error if used outside ServiceProvider
 */
export const useServices = (): ServiceContainer => {
  const services = useContext(ServiceContext);
  
  if (!services) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  
  return services;
};

/**
 * Individual service hooks for convenience
 * These follow the Dependency Inversion Principle
 */

export const useApiService = (): IApiService => {
  return useServices().apiService;
};

export const useStorageService = (): IStorageService => {
  return useServices().storageService;
};

export const useCacheService = (): ICacheService => {
  return useServices().cacheService;
};

/**
 * HOC for injecting services into class components
 */
export interface WithServicesProps {
  services: ServiceContainer;
}

export function withServices<P extends WithServicesProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'services'>> {
  return function WrappedComponent(props: Omit<P, 'services'>) {
    const services = useServices();
    return <Component {...(props as P)} services={services} />;
  };
}

/**
 * Service initialization function
 * Call this on app startup to initialize services
 */
export const initializeServices = async (): Promise<void> => {
  try {
    console.log('[Services] Initializing core services...');
    
    // Initialize cache service cleanup
    // cacheService is already initialized with auto-cleanup
    
    // Clean up expired storage items
    await storageService.removeExpiredItems();
    
    // Log service initialization
    if (__DEV__) {
      const cacheStats = cacheService.getStats();
      const storageInfo = await storageService.getStorageInfo();
      const apiConfig = apiService.getConfig();
      
      console.log('[Services] Initialization complete:', {
        cache: cacheStats,
        storage: {
          keys: storageInfo.totalKeys,
          estimatedSize: `${(storageInfo.estimatedSize / 1024).toFixed(2)}KB`,
        },
        api: {
          baseURL: apiConfig.baseURL,
          timeout: apiConfig.timeout,
        },
      });
    }
    
    console.log('[Services] All core services initialized successfully');
  } catch (error) {
    console.error('[Services] Failed to initialize services:', error);
    // Don't throw - let app continue with potentially degraded functionality
  }
};

/**
 * Service cleanup function
 * Call this on app shutdown to clean up resources
 */
export const cleanupServices = (): void => {
  try {
    console.log('[Services] Cleaning up services...');
    
    // Cleanup cache service
    cacheService.destroy();
    
    console.log('[Services] Cleanup complete');
  } catch (error) {
    console.error('[Services] Error during cleanup:', error);
  }
};