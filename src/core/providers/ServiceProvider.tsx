/**
 * @fileoverview Service Provider for Dependency Injection
 * Follows SOLID principles - Dependency Inversion Principle (DIP)
 * Provides all services through React Context
 */

import React, { createContext, useContext, ReactNode } from "react";
import {
  IApiService,
  IStorageService,
  ICacheService,
  IAuthService,
  IDictionaryService,
  IFavoritesService,
  ILanguageService,
  ICategoryService,
  IUserStatsService,
  IContributorRequestService,
} from "../interfaces";
import { IFavoritesSyncService } from "../interfaces/IFavoritesSyncService";
import {
  ApiService,
  StorageService,
  CacheService,
  DictionaryService,
  FavoritesService,
  CategoryService,
  createAuthService,
  apiService,
  storageService,
  cacheService,
  ContributorRequestService,
} from "../services";
import { FavoritesSyncService } from "../services/FavoritesSyncService";
import { UserStatsService } from "../services/UserStatsService";
import { LanguageService } from "../services/LanguageService";

/**
 * Service container interface
 * Follows Interface Segregation Principle (ISP)
 */
export interface ServiceContainer {
  apiService: IApiService;
  storageService: IStorageService;
  cacheService: ICacheService;
  authService: IAuthService;
  dictionaryService: IDictionaryService;
  favoritesService: IFavoritesService;
  favoritesSyncService: IFavoritesSyncService;
  languageService: ILanguageService;
  categoryService: ICategoryService;
  userStatsService: IUserStatsService;
  contributorRequestService: IContributorRequestService;
}

// Create sync service first
const favoritesSyncService = new FavoritesSyncService(
  apiService,
  storageService,
  cacheService
);

/**
 * Default service implementations
 * Using singleton instances for consistent state
 */
const defaultServices: ServiceContainer = {
  apiService,
  storageService,
  cacheService,
  authService: createAuthService(apiService, storageService, cacheService),
  dictionaryService: new DictionaryService(apiService, cacheService),
  favoritesService: new FavoritesService(
    apiService,
    cacheService,
    storageService,
    favoritesSyncService
  ),
  favoritesSyncService,
  languageService: new LanguageService(apiService, cacheService),
  categoryService: new CategoryService(apiService, cacheService),
  userStatsService: new UserStatsService(apiService, cacheService),
  contributorRequestService: new ContributorRequestService(
    apiService,
    cacheService
  ),
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
  services = {},
}) => {
  // Merge provided services with defaults
  const serviceContainer: ServiceContainer = {
    ...defaultServices,
    ...services,
  } as ServiceContainer;

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
    throw new Error("useServices must be used within a ServiceProvider");
  }

  return services;
};

/**
 * Alias for useServices for consistency
 */
export const useServiceProvider = (): ServiceContainer => {
  return useServices();
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

export const useAuthService = (): IAuthService => {
  return useServices().authService;
};

export const useDictionaryService = (): IDictionaryService => {
  return useServices().dictionaryService;
};

export const useFavoritesService = (): IFavoritesService => {
  return useServices().favoritesService;
};

export const useLanguageService = (): ILanguageService => {
  return useServices().languageService;
};

export const useCategoryService = (): ICategoryService => {
  return useServices().categoryService;
};

export const useUserStatsService = (): IUserStatsService => {
  return useServices().userStatsService;
};

/**
 * HOC for injecting services into class components
 */
export interface WithServicesProps {
  services: ServiceContainer;
}

export function withServices<P extends WithServicesProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, "services">> {
  return function WrappedComponent(props: Omit<P, "services">) {
    const services = useServices();
    return <Component {...(props as P)} services={services} />;
  };
}

/**
 * Service cleanup function
 * Call this on app shutdown to clean up resources
 */
export const cleanupServices = (): void => {
  try {
    console.log("[Services] Cleaning up services...");

    // Cleanup cache service
    cacheService.destroy();

    console.log("[Services] Cleanup complete");
  } catch (error) {
    console.error("[Services] Error during cleanup:", error);
  }
};
