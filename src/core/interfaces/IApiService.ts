/**
 * @fileoverview Base API Service Interface
 * Follows SOLID principles - Single Responsibility + Interface Segregation
 */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Base API Service interface following ISP
 * Each HTTP method has its own responsibility
 */
export interface IApiService {
  /**
   * GET request
   */
  get<T>(
    endpoint: string, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * POST request
   */
  post<T, D = any>(
    endpoint: string, 
    data?: D, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * PUT request
   */
  put<T, D = any>(
    endpoint: string, 
    data?: D, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * DELETE request
   */
  delete<T>(
    endpoint: string, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * PATCH request
   */
  patch<T, D = any>(
    endpoint: string, 
    data?: D, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void;

  /**
   * Clear authorization token
   */
  clearAuthToken(): void;

  /**
   * Set base URL
   */
  setBaseUrl(url: string): void;
}