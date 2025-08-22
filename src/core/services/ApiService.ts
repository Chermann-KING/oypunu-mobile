/**
 * @fileoverview Axios-based API Service Implementation
 * Follows SOLID principles - Single Responsibility for HTTP communication
 * Implements IApiService interface (DIP)
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { IApiService, ApiResponse, ApiError, RequestConfig } from '../interfaces/IApiService';

/**
 * Configuration for API service
 */
export interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  enableLogging: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ApiServiceConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000, // 10 seconds
  retries: 3,
  enableLogging: __DEV__, // Only in development
};

/**
 * Concrete implementation of IApiService using Axios
 * Follows SRP - Only responsible for HTTP communication
 */
export class ApiService implements IApiService {
  private client: AxiosInstance;
  private config: ApiServiceConfig;

  constructor(config: Partial<ApiServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = this.createClient();
    this.setupInterceptors();
  }

  /**
   * Create configured Axios instance
   */
  private createClient(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.enableLogging) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }
        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[API] Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.enableLogging) {
          console.log(`[API] Response ${response.status}:`, response.data);
        }
        return response;
      },
      async (error) => {
        if (this.config.enableLogging) {
          console.error('[API] Response Error:', error.response?.data || error.message);
        }

        // Handle token refresh logic here if needed
        if (error.response?.status === 401) {
          // Token expired - will be handled by AuthService
          return Promise.reject(this.transformError(error));
        }

        // Retry logic for network errors
        if (this.shouldRetry(error) && error.config && !error.config._retry) {
          error.config._retry = true;
          error.config._retryCount = (error.config._retryCount || 0) + 1;
          
          if (error.config._retryCount <= this.config.retries) {
            const delay = Math.pow(2, error.config._retryCount) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.client.request(error.config);
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors and 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  /**
   * Transform Axios error to our ApiError interface
   */
  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        status: error.response.status,
        message: (error.response.data as any)?.message || error.message,
        code: (error.response.data as any)?.code || error.code,
        details: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
        details: error.request,
      };
    } else {
      // Other error
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }
  }

  /**
   * Transform Axios response to our ApiResponse interface
   */
  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }

  /**
   * Merge request config with defaults
   */
  private mergeConfig(config?: RequestConfig) {
    if (!config) return {};

    return {
      headers: config.headers,
      timeout: config.timeout,
      // Note: retries are handled by interceptor
    };
  }

  // IApiService implementation

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(endpoint, this.mergeConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      throw error; // Already transformed by interceptor
    }
  }

  async post<T, D = any>(endpoint: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(endpoint, data, this.mergeConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      throw error; // Already transformed by interceptor
    }
  }

  async put<T, D = any>(endpoint: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(endpoint, data, this.mergeConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      throw error; // Already transformed by interceptor
    }
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(endpoint, this.mergeConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      throw error; // Already transformed by interceptor
    }
  }

  async patch<T, D = any>(endpoint: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(endpoint, data, this.mergeConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      throw error; // Already transformed by interceptor
    }
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  setBaseUrl(url: string): void {
    this.client.defaults.baseURL = url;
    this.config.baseURL = url;
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiServiceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update client if baseURL or timeout changed
    if (newConfig.baseURL) {
      this.client.defaults.baseURL = newConfig.baseURL;
    }
    if (newConfig.timeout) {
      this.client.defaults.timeout = newConfig.timeout;
    }
  }

  /**
   * Get Axios instance for advanced usage (use sparingly)
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

/**
 * Singleton instance for app-wide usage
 */
export const apiService = new ApiService();