import { Category } from "./IDictionaryService";

/**
 * Category Service Interface
 * Suit SOLID (ISP/DIP) pour la gestion des catégories
 */
export interface ICategoryService {
  /**
   * Liste les catégories, optionnellement filtrées par langue
   */
  getCategories(languageId?: string): Promise<Category[]>;

  /**
   * Récupère une catégorie par ID
   */
  getCategoryById(id: string): Promise<Category>;

  /**
   * Crée une catégorie (CONTRIBUTOR+)
   */
  createCategory(data: Omit<Category, "id" | "wordCount">): Promise<Category>;

  /**
   * Met à jour une catégorie (CONTRIBUTOR+ pour ses propres; ADMIN+ sinon)
   */
  updateCategory(
    id: string,
    data: Partial<Omit<Category, "id" | "wordCount">>
  ): Promise<Category>;

  /**
   * Supprime une catégorie (CONTRIBUTOR+ pour ses propres; ADMIN+ sinon)
   */
  deleteCategory(id: string): Promise<void>;
}
