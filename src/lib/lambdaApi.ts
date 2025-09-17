// Lambda API Client for Pi Admin Dashboard
// Enhanced with better error handling, types, and configuration

import { env } from './env';
import { AdminUser } from '@/types/adminUsers';

// API Response Types
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiErrorClass extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

class LambdaApiClient {
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseUrl: env.lambdaApiUrl,
      timeout: env.apiTimeout,
      retryAttempts: 3,
      retryDelay: 1000,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>,
    retryCount = 0
  ): Promise<T> {
    // Ensure proper URL construction
    const baseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    // Add Authorization header if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response types
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiError: ApiError = {
          message: responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: responseData?.code,
        };
        
        // Retry on certain status codes
        if (this.shouldRetry(response.status) && retryCount < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          return this.makeRequest(endpoint, method, data, headers, retryCount + 1);
        }
        
        throw new ApiErrorClass(apiError.message, apiError.status, apiError.code);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiErrorClass('Request timeout', 408);
        }
        
        // Retry on network errors
        if (retryCount < this.config.retryAttempts && this.isNetworkError(error)) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          return this.makeRequest(endpoint, method, data, headers, retryCount + 1);
        }
        
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  private shouldRetry(status: number): boolean {
    // Retry on server errors and certain client errors
    return status >= 500 || status === 408 || status === 429;
  }

  private isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') || 
           error.message.includes('network') || 
           error.message.includes('ERR_NETWORK');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication API calls
  async getCurrentUser(): Promise<AdminUser> {
    return this.makeRequest('/auth/current-user');
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    return this.makeRequest('/auth/verify-token', 'POST', { token });
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; statusCode: number }> {
    console.log('Starting health check...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const baseUrl = this.config.baseUrl.endsWith('/') 
        ? this.config.baseUrl.slice(0, -1) 
        : this.config.baseUrl;
      const healthCheckUrl = `${baseUrl}/auth/verify-token`;
      
      console.log('Making fetch request to:', healthCheckUrl);
      const response = await fetch(healthCheckUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'health-check' }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('Health check response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const result = { status: 'healthy', statusCode: response.status };
      console.log('Health check successful:', result);
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Service unavailable');
    }
  }

  // Admin Users API calls
  async getAdminUsers(): Promise<AdminUser[]> {
    return this.makeRequest('/admin-users');
  }

  async getAdminUser(id: string): Promise<AdminUser> {
    return this.makeRequest(`/admin-users/${id}`);
  }

  async createAdminUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.makeRequest('/admin-users', 'POST', userData);
  }

  async updateAdminUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.makeRequest(`/admin-users/${id}`, 'PUT', userData);
  }

  async deleteAdminUser(id: string): Promise<void> {
    return this.makeRequest(`/admin-users/${id}`, 'DELETE');
  }

  // Configuration methods
  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
  }

  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
  }

  setRetryConfig(attempts: number, delay: number): void {
    this.config.retryAttempts = attempts;
    this.config.retryDelay = delay;
  }
}

// Export singleton instance
export const lambdaApi = new LambdaApiClient();

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  cognitoSub: string;
}

export { ApiErrorClass };
export default lambdaApi;