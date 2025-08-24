import { IApiService } from "../interfaces/IApiService";
import { ICacheService } from "../interfaces/ICacheService";
import { ICategoryService } from "../interfaces/ICategoryService";
import { Category } from "../interfaces/IDictionaryService";

export class CategoryService implements ICategoryService {
  constructor(private api: IApiService, private cache: ICacheService) {}

  async getCategories(languageId?: string): Promise<Category[]> {
    const cacheKey = `categories${languageId ? `:${languageId}` : ""}`;
    const cached = await this.cache.get<Category[]>(cacheKey);
    if (cached) return cached;

    const params = languageId
      ? `?language=${encodeURIComponent(languageId)}`
      : "";

    const resp = await this.api.get<{ data?: Category[] } | Category[]>(
      `/categories${params}`
    );
    const list = Array.isArray(resp.data)
      ? (resp.data as Category[])
      : (resp.data?.data as Category[]) || [];
    await this.cache.set(cacheKey, list, 1800);
    return list;
  }

  async getCategoryById(id: string): Promise<Category> {
    const cacheKey = `category:${id}`;
    const cached = await this.cache.get<Category>(cacheKey);
    if (cached) return cached;

    // Backend: /categories/:id
    const resp = await this.api.get<Category>(`/categories/${id}`);
    await this.cache.set(cacheKey, resp.data, 3600);
    return resp.data;
  }

  async createCategory(
    data: Omit<Category, "id" | "wordCount">
  ): Promise<Category> {
    // Backend: POST /categories
    const resp = await this.api.post<Category>(`/categories`, data);
    // Invalider caches
    this.cache.delete("categories");
    if (data.language) this.cache.delete(`categories:${data.language}`);
    return resp.data;
  }

  async updateCategory(
    id: string,
    data: Partial<Omit<Category, "id" | "wordCount">>
  ): Promise<Category> {
    // Backend: PATCH /categories/:id
    const resp = await this.api.patch<Category>(`/categories/${id}`, data);
    // Invalider caches ciblés
    this.cache.delete(`category:${id}`);
    if (data.language) this.cache.delete(`categories:${data.language}`);
    this.cache.delete("categories");
    return resp.data;
  }

  async deleteCategory(id: string): Promise<void> {
    // Backend: DELETE /categories/:id
    await this.api.delete<void>(`/categories/${id}`);
    // Invalider caches génériques
    this.cache.delete(`category:${id}`);
    this.cache.delete("categories");
  }
}
