// Core services exports following SOLID principles
// Single entry point for all service implementations

export * from "./ApiService";
export * from "./AuthService";
export * from "./CacheService";
export * from "./CategoryService";
export * from "./DictionaryService";
export * from "./FavoritesService";
export * from "./FavoritesSyncService";
export * from "./LanguageService";
export * from "./SocialAuthService";
export * from "./StorageService";
export * from "./UserStatsService";
export * from "./ContributorRequestService";

// Re-export interfaces for convenience
export * from "../interfaces";
