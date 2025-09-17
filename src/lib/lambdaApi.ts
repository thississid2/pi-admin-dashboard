// Lambda API Client for Pi Admin Dashboard
// This replaces the Next.js API routes with Lambda function calls

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

class LambdaApiClient {
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_LAMBDA_API_URL || (typeof window !== 'undefined' ? '/api/lambda' : 'https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev'),
      timeout: 30000,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    // Ensure proper URL construction - remove double slashes
    const baseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error (${response.status}):`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Authentication API calls
  async getCurrentUser() {
    return this.makeRequest('/auth/current-user');
  }

  async verifyToken(token: string) {
    return this.makeRequest('/auth/verify-token', 'POST', { token });
  }

  // Health check endpoint
  async healthCheck() {
    console.log('Starting health check...');
    try {
      // Since there's no dedicated health endpoint, we'll check if the API Gateway is responding
      // by making a request and checking if we get a proper HTTP response (even if it's an error)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for health check
      
      // Ensure proper URL construction - remove double slashes
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
      
      // If we get any HTTP response (including 401, 400, etc.), the service is up and responding
      // We only care that the API Gateway and Lambda are reachable, not about authentication
      const result = { status: 'healthy', statusCode: response.status };
      console.log('Health check successful:', result);
      return result;
    } catch (error) {
      // Network errors, timeouts, or fetch failures indicate the service is down
      console.error('Health check failed:', error);
      throw new Error('Service unavailable');
    }
  }

  // Admin Users API calls
  async getAdminUsers() {
    return this.makeRequest('/admin-users');
  }

  async getAdminUser(id: string) {
    return this.makeRequest(`/admin-users/${id}`);
  }

  async createAdminUser(userData: any) {
    return this.makeRequest('/admin-users', 'POST', userData);
  }

  async updateAdminUser(id: string, userData: any) {
    return this.makeRequest(`/admin-users/${id}`, 'PUT', userData);
  }

  async deleteAdminUser(id: string) {
    return this.makeRequest(`/admin-users/${id}`, 'DELETE');
  }

  // Utility methods
  setBaseUrl(url: string) {
    this.config.baseUrl = url;
  }

  setTimeout(timeout: number) {
    this.config.timeout = timeout;
  }
}

// Export singleton instance
export const lambdaApi = new LambdaApiClient();

// Export types for TypeScript
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy: string;
  department?: string;
  cognitoSub: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  cognitoSub: string;
}

export default lambdaApi;