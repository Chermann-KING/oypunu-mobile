/**
 * @fileoverview Core module exports
 * Follows SOLID principles - Single entry point for all core functionality
 */

// Interfaces (DIP - Depend on abstractions)
export * from './interfaces';

// Services (Concrete implementations)
export * from './services';

// Stores (State management)
export * from './stores';

// Providers (Dependency injection)
export * from './providers/ServiceProvider';