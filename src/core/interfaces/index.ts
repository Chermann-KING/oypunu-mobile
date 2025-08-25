// Core interfaces following SOLID principles
// Interface Segregation Principle (ISP) - Small, focused interfaces
// Dependency Inversion Principle (DIP) - Depend on abstractions

export * from "./IApiService";
export * from "./IAuthService";
export * from "./ICacheService";
export * from "./ICategoryService";
export * from "./ICommunityService";
// Re-export IDictionaryService selectively to avoid 'Language' name collision
export type {
  IDictionaryService,
  SearchFilters,
  SearchOptions,
  SearchResult,
  CreateWordData,
  Category,
} from "./IDictionaryService";
export * from "./IFavoritesService";
export * from "./IFavoritesSyncService";
// ILanguageService exports its own Language type; keep this as the canonical Language
export * from "./ILanguageService";
export * from "./IMessagingService";
export * from "./IStorageService";
export * from "./IUserService";
export * from "./IUserStatsService";
export * from "./IContributorRequestService";
