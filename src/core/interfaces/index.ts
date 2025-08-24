// Core interfaces following SOLID principles
// Interface Segregation Principle (ISP) - Small, focused interfaces
// Dependency Inversion Principle (DIP) - Depend on abstractions

export * from "./IApiService";
export * from "./IAuthService";
export * from "./IStorageService";
export * from "./ICacheService";
// Éviter le conflit de nom 'Language' entre IDictionaryService et ILanguageService
export type {
  SearchFilters,
  SearchOptions,
  SearchResult,
  CreateWordData,
  Category,
  IDictionaryService,
} from "./IDictionaryService";
export * from "./IFavoritesService";
export * from "./ILanguageService";
export * from "./ICategoryService";
export * from "./IUserService";
export * from "./IUserStatsService";
export * from "./ICommunityService";
export * from "./IMessagingService";
